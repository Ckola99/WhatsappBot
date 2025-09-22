// nodejs-bot/src/db.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../contacts.db');
const db = new Database(dbPath);

// Expanded schema: per-contact bot toggle, conversation state, and next_followup for scheduling
db.prepare(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    name TEXT,
    location TEXT,
    last_message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    bot_enabled INTEGER DEFAULT 1,
    conversation_state TEXT DEFAULT 'active', -- active, waiting, followed_up, complete
    next_followup DATETIME
  )
`).run();

// Upsert prepared statement
const insertOrUpdate = db.prepare(`
  INSERT INTO contacts (phone, name, location, last_message, bot_enabled, conversation_state, next_followup)
  VALUES (@phone, @name, @location, @last_message, COALESCE(@bot_enabled, 1), COALESCE(@conversation_state, 'active'), @next_followup)
  ON CONFLICT(phone) DO UPDATE SET
    name = COALESCE(excluded.name, contacts.name),
    location = COALESCE(excluded.location, contacts.location),
    last_message = excluded.last_message,
    timestamp = CURRENT_TIMESTAMP,
    bot_enabled = COALESCE(excluded.bot_enabled, contacts.bot_enabled),
    conversation_state = COALESCE(excluded.conversation_state, contacts.conversation_state),
    next_followup = excluded.next_followup
`);

function saveContact({ phone, name = null, location = null, last_message = '', bot_enabled = 1, conversation_state = 'active', next_followup = null }) {
  insertOrUpdate.run({ phone, name, location, last_message, bot_enabled, conversation_state, next_followup });
}

function getContact(phone) {
  return db.prepare('SELECT * FROM contacts WHERE phone = ?').get(phone);
}

function setBotEnabled(phone, enabled) {
  // ensure row exists (upsert minimal) then update
  db.prepare(`
    INSERT INTO contacts(phone) VALUES (?)
    ON CONFLICT(phone) DO UPDATE SET bot_enabled = ?
  `).run(phone, enabled ? 1 : 0);
}

function setConversationState(phone, state) {
  db.prepare(`
    INSERT INTO contacts(phone) VALUES (?)
    ON CONFLICT(phone) DO UPDATE SET conversation_state = ?
  `).run(phone, state);
}

function setNextFollowup(phone, isoDatetime) {
  db.prepare(`
    INSERT INTO contacts(phone) VALUES (?)
    ON CONFLICT(phone) DO UPDATE SET next_followup = ?
  `).run(phone, isoDatetime);
}

function fetchContactsForFollowup(cutoffISO) {
  // returns contacts whose next_followup is set and <= cutoff, and still bot_enabled=1 and conversation not complete.
  return db.prepare(`
    SELECT * FROM contacts
    WHERE bot_enabled = 1
      AND conversation_state IN ('waiting')
      AND next_followup IS NOT NULL
      AND next_followup <= ?
  `).all(cutoffISO);
}

function allContacts() {
  return db.prepare('SELECT * FROM contacts ORDER BY timestamp DESC').all();
}

module.exports = {
  saveContact,
  getContact,
  setBotEnabled,
  setConversationState,
  setNextFollowup,
  fetchContactsForFollowup,
  allContacts
};
