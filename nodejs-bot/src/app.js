const express = require('express');
const axios = require('axios');
const app = express();
const { allContacts } = require('./db'); // changed import

app.use(express.json());

app.post('/message', async (req, res) => {
	const { from, message } = req.body;
	try {
		const aiRes = await axios.post('http://127.0.0.1:8000/reply', { message, phone: from });
		const reply = aiRes.data.reply;
		return res.json({ reply });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: 'AI service failed' });
	}
});

app.get('/contacts', (req, res) => {
	const contacts = allContacts();
	res.json(contacts);
});

module.exports = app;
