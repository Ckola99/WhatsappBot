const { saveContact } = require('../src/db');
const Database = require('better-sqlite3');
const db = new Database('./contacts.db');

test("it should save a new contact", () => {
	saveContact({
		phone: "12345",
		name: "Thembi",
		location: "South Africa",
		last_message: "Hi"
	});

	const stmt = db.prepare('SELECT * FROM contacts WHERE phone = ?');
	const contact = stmt.get("12345");

	expect(contact.name).toBe("Thembi");
	expect(contact.location).toBe("South Africa");
});

afterAll(() => {
	db.close();
});
