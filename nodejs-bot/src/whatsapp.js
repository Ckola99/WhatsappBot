const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const axios = require('axios');
const path = require('path');

async function startWhatsAppBot() {
	// Create persistent auth state folder
	const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth'));

	const { version } = await fetchLatestBaileysVersion();
	const sock = makeWASocket({
		version,
		auth: state,
		printQRInTerminal: true,
	});

	// Save updated credentials when they change
	sock.ev.on('creds.update', saveCreds);

	// ✅ Listen for new messages
	sock.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify') return;

		const msg = messages[0];
		if (!msg.message || msg.key.fromMe) return;

		const sender = msg.key.remoteJid;
		const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

		console.log(`📥 New message from ${sender}: ${text}`);

		try {
			const response = await axios.post('http://127.0.0.1:8000/reply', { message: text });
			const reply = response.data.reply;

			await sock.sendMessage(sender, { text: reply });
			console.log(`📤 Replied: ${reply}`);
		} catch (error) {
			console.error('❌ Error contacting AI service:', error.message);
			await sock.sendMessage(sender, { text: 'Oops! There was an error on the server.' });
		}
	});

	// 🔌 Auto-reconnect if disconnected
	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect, qr } = update;

		if (qr) {
			console.log('\n📲 Scan this QR Code with WhatsApp:');
			require('qrcode-terminal').generate(qr, { small: true })
		}

		if (connection === 'close') {
			const shouldReconnect =
				lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

			console.log('🔌 Connection closed. Reconnecting:', shouldReconnect);
			if (shouldReconnect) {
				startWhatsAppBot(); // Reconnect
			}
		} else if (connection === 'open') {
			console.log('✅ WhatsApp connection established!');
		}
	});
}

module.exports = { startWhatsAppBot };
