const db = require('./db');

const createEvent = (title, description, date, location, capacity, image, callback) => {
  const query = 'INSERT INTO events (title, description, date, location, capacity, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, location, capacity, image], callback);
};

const getEvents = (callback) => {
  const query = 'SELECT * FROM events';
  db.query(query, callback);
};

module.exports = { createEvent, getEvents };