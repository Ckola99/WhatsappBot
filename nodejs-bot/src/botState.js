let isBotEnabled = true;
const ADMIN_PHONE = "+27815096344@s.whatsapp.net";

function enableBot() {
	isBotEnabled = true;
}

function disableBot() {
	isBotEnabled = false;
}

function isEnabled() {
	return isBotEnabled;
}

function isAdmin(sender) {
	return sender === ADMIN_PHONE;
}

module.exports = {
	enableBot,
	disableBot,
	isEnabled,
	isAdmin
};
