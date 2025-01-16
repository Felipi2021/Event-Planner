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
    const events = results.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0] // Format date to YYYY-MM-DD
    }));
    res.send(events);
  });
};

const registerForEvent = (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const query = 'INSERT INTO registration (user_id, event_id) VALUES (?, ?)';
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

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const checkQuery = 'SELECT * FROM registration WHERE user_id = ? AND event_id = ?';
  db.query(checkQuery, [userId, eventId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    if (results.length > 0) {
      return res.status(400).send({ message: 'User already marked as attending this event.' });
    }

    const query = 'INSERT INTO registration (user_id, event_id) VALUES (?, ?)';
    db.query(query, [userId, eventId], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }

      res.send({ message: 'You have been marked as attending this event!' });
    });
  });
};

const removeAttendance = (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const query = 'DELETE FROM registration WHERE user_id = ? AND event_id = ?';
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

module.exports = { createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance };

//working. problem that was in code is now solved, but i want it to hold the attendance option
//on server after logging out and logging back in to account because database holds this 
//information but when i relog to account it seems forgetting and i cant click attend because
//it as already attended but when button changes to remove attendance i can remove it and 
//cycle works again + give real use to registration button + delete registration button