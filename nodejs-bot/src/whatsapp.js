const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const { saveContact, getContact, setBotEnabled, setConversationState, setNextFollowup, fetchContactsForFollowup } = require('./db');
const { isEnabled, enableBot, disableBot, isAdmin } = require('./botState');

const FOLLOWUP_HOURS = 24;

async function startWhatsAppBot() {
	// Create persistent auth state folder
	const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth'));
	const { version } = await fetchLatestBaileysVersion();

	const sock = makeWASocket({
		version,
		auth: state,
	});

	// Save updated credentials when they change
	sock.ev.on('creds.update', saveCreds);

	const followupIntervalMs = 1440 * 60 * 1000;
	const followupTimer = setInterval(async () => {
		try {
			const cutoff = new Date().toISOString();
			const rows = fetchContactsForFollowup(cutoff);
			for (const c of rows) {
				try {
					// don't attempt if conversation already completed or bot disabled
					if (!c.bot_enabled || c.conversation_state === 'complete') continue;

					const remoteJid = c.phone;
					const followUpMessage = `Hi again 👋 — just checking if you still need help. Reply and we'll continue.`;

					await sock.sendMessage(remoteJid, { text: followUpMessage });
					console.log(`⏰ Sent follow-up to ${remoteJid}`);
					// mark as followed up to avoid repeated followups. You can set next_followup if you want another reminder later.
					setConversationState(remoteJid, 'followed_up');
					setNextFollowup(remoteJid, null);
				} catch (err) {
					console.error('Error sending followup to', c.phone, err?.message || err);
				}
			}
		} catch (err) {
			console.error('Followup scheduler error:', err?.message || err);
		}
	}, followupIntervalMs);

	sock.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify') return;
		const msg = messages[0];
		if (!msg || !msg.message) return;

		const fromMe = !!msg.key.fromMe; // message sent by the connected WhatsApp account
		const remoteJid = msg.key.remoteJid;
		const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();

		// If the connected account (owner) sends commands from within a chat, process per-conversation commands
		if (fromMe) {
			// Commands the owner can send inside the chat to control the bot for THIS conversation
			const lower = text.toLowerCase();
			if (lower === '/bot off' || lower === '/bot pause') {
				setBotEnabled(remoteJid, 0);
				await sock.sendMessage(remoteJid, { text: '🤖 Bot paused for this conversation. You can reply directly — the bot will not auto-reply here.' });
				console.log(`Owner paused bot for ${remoteJid}`);
				return;
			}
			if (lower === '/bot on' || lower === '/bot resume') {
				setBotEnabled(remoteJid, 1);
				await sock.sendMessage(remoteJid, { text: '✅ Bot resumed for this conversation.' });
				console.log(`Owner resumed bot for ${remoteJid}`);
				return;
			}
			// you can add owner-only commands here
			return;
		}

		// At this point message is incoming (not from owner)
		console.log(`📥 New message from ${remoteJid}: ${text}`);

		// Admin (remote) control for global toggle: allow ADMIN_PHONE to send /stop /start
		if (isAdmin(remoteJid)) {
			const lower = text.toLowerCase();
			if (lower === '/stop') {
				disableBot();
				await sock.sendMessage(remoteJid, { text: "🤖 Bot has been stopped globally." });
				return;
			}
			if (lower === '/start') {
				enableBot();
				await sock.sendMessage(remoteJid, { text: "✅ Bot is now active globally." });
				return;
			}
		}

		// Check global enable
		if (!isEnabled()) {
			console.log("❌ Bot is disabled globally. Ignoring incoming message.");
			return;
		}

		// Check per-contact enabled flag
		const contact = getContact(remoteJid);
		if (contact && contact.bot_enabled === 0) {
			console.log(`❌ Bot is paused for ${remoteJid}. Ignoring.`);
			return;
		}

		// Send to Python AI backend
		try {
			const response = await axios.post('http://127.0.0.1:8000/reply', { message: text, phone: remoteJid }, { timeout: 15000 });
			const reply = response.data.reply;
			const location = response.data.location || null;
			const complete = !!response.data.complete;

			await sock.sendMessage(remoteJid, { text: reply });

			// Persist/update contact and schedule followup
			saveContact({
				phone: remoteJid,
				name: contact?.name || null,
				location,
				last_message: text,
				// if not complete, set state to waiting and schedule followup
				conversation_state: complete ? 'complete' : 'waiting'
			});

			if (!complete) {
				const next = new Date(Date.now() + FOLLOWUP_HOURS * 60 * 60 * 1000).toISOString();
				setNextFollowup(remoteJid, next);
			} else {
				// completed — clear followup
				setNextFollowup(remoteJid, null);
			}

			console.log(`📤 Replied to ${remoteJid}: ${reply}`);
		} catch (error) {
			console.error('❌ Error contacting AI service:', error?.message || error);
			// Tell user we failed
			try {
				await sock.sendMessage(remoteJid, { text: 'Oops — there was an error on the server. Please try again later.' });
			} catch (err) {
				console.error('Error sending error reply:', err?.message || err);
			}
		}
	});

	// connection update: show qr, handle reconnect logic. Keep reconnect but avoid stacking timers.
	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect, qr } = update;
		if (qr) {
			console.log('\n📲 Scan this QR Code with WhatsApp:');
			require('qrcode-terminal').generate(qr, { small: true });
		}

		if (connection === 'close') {
			const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
			const shouldReconnect = statusCode !== DisconnectReason.loggedOut
			console.log('🔌 Connection closed. Reconnecting:', shouldReconnect);
			if (!shouldReconnect) {
				console.log('Logged out. Deleting auth folder and stopping bot.');
				clearInterval(followupTimer);
				fs.removeSync(path.join(__dirname, '../auth'));
			} else {
				// clean and restart
				clearInterval(followupTimer);
				// small delay then restart
				setTimeout(() => startWhatsAppBot().catch(e => console.error('reconnect error', e)), 2000);
			}
		} else if (connection === 'open') {
			console.log('✅ WhatsApp connection established!');
		}
	});

	return sock;
}

module.exports = { startWhatsAppBot };
