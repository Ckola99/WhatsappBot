const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/message', async (req, res) => {
	const { from, message } = req.body;

	try {
		// Send to Python AI
		const aiRes = await axios.post('http://localhost:8000/reply', { message });
		const reply = aiRes.data.reply;

		// (Later: send reply via WhatsApp here)
		return res.json({ reply });
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ error: 'AI service failed' });
	}
});

module.exports = app;
