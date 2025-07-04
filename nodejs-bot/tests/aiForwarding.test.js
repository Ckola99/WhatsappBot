const request = require('supertest');
const app = require('../src/app');

describe('AI Forwarding', () => {
	it('should forward message to Python AI service and return reply', async () => {
		const res = await request(app)
			.post('/message')
			.send({ from: '12345', message: 'Hi!' });

		expect(res.statusCode).toBe(200);
		expect(res.body.reply).toBeDefined();
	});
});


