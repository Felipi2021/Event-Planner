const db = require('../models/db');

const createEvent = (req, res) => {
  const { title, description, date, location, capacity } = req.body;
  const query = 'INSERT INTO events (title, description, date, location, capacity) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, location, capacity], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ message: 'Event created successfully!' });
  });
};

const getAllEvents = (req, res) => {
  const query = 'SELECT * FROM events';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};
const registerForEvent = (req, res) => {
  const userId = req.body.userId;
  const eventId = req.params.id;

  const query = 'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)';
  db.query(query, [userId, eventId], (err, result) => {
    if (err) return res.status(500).send(err);
    const updateQuery = 'UPDATE events SET attendees_count = attendees_count + 1 WHERE id = ?';
    db.query(updateQuery, [eventId], (err) => {
      if (err) return res.status(500).send(err);

      res.send({ message: 'Successfully registered for the event!' });
    });
  });
};
const markAttendance = (req, res) => {
    const { userId } = req.body;
    const eventId = req.params.id;
  
    const query = 'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)';
    db.query(query, [userId, eventId], (err) => {
      if (err) return res.status(500).send(err);
  
      res.send({ message: 'You have been marked as attending this event!' });
    });
  };

  const removeAttendance = (req, res) => {
    const userId = req.userId;
    const eventId = req.params.id;
  
    const query = 'DELETE FROM registrations WHERE user_id = ? AND event_id = ?';
    db.query(query, [userId, eventId], (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error removing attendance', error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: 'No attendance record found.' });
      }
  
      res.send({ message: 'You are no longer attending this event.' });
    });
  };
module.exports = { createEvent, getAllEvents, registerForEvent, markAttendance ,removeAttendance};
  
