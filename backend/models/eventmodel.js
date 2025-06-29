const db = require('./db');

const createEvent = (title, description, date, location, capacity, image, group_id, callback) => {
  const query = 'INSERT INTO events (title, description, date, location, capacity, image, group_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, location, capacity, image, group_id], callback);
};

const getEvents = (callback) => {
  const query = 'SELECT * FROM events';
  db.query(query, callback);
};

module.exports = { createEvent, getEvents };