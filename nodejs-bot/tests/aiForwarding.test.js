const request = require('supertest');
const app = require('../src/app');
const nock = require('nock');

describe('AI Forwarding', () => {
	beforeEach(() => {
		nock('http://127.0.0.1:8000')
			.post('/reply')
			.reply(200, { reply: 'Hello there! How can I assist you?' });
	});

	it('should forward message to Python AI service and return reply', async () => {
		const res = await request(app)
			.post('/message')
			.send({ from: '12345', message: 'Hi!' });

		expect(res.statusCode).toBe(200);
		expect(res.body.reply).toBeDefined();
	});
});


afterAll(() => {
	nock.cleanAll(); // clears any mocks to avoid leaks
});
