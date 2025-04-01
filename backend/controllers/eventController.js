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
      date: event.date.toISOString().split('T')[0] 
    }));
    res.send(events);
  });
};

const registerForEvent = (req, res) => {
  const { userId } = req.body; 
  const eventId = req.params.id; 

  console.log('Received userId:', userId);
  console.log('Received eventId:', eventId);

  if (!userId || !eventId) {
    console.log('Missing userId or eventId');
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const checkQuery = 'SELECT * FROM registration WHERE user_id = ? AND event_id = ?';
  db.query(checkQuery, [userId, eventId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    if (results.length > 0) {
      console.log('User is already registered for this event.');
      return res.status(400).send({ message: 'User is already registered for this event.' });
    }

    const insertQuery = 'INSERT INTO registration (user_id, event_id) VALUES (?, ?)';
    db.query(insertQuery, [userId, eventId], (err) => {
      if (err) {
        console.error('Error inserting registration:', err);
        return res.status(500).send({ message: 'Error registering for event.', error: err });
      }

      const updateQuery = 'UPDATE events SET attendees_count = attendees_count + 1 WHERE id = ?';
      db.query(updateQuery, [eventId], (err, result) => {
        if (err) {
          console.error('Error updating attendees count:', err);
          return res.status(500).send({ message: 'Error updating attendees count.', error: err });
        }

        console.log('Attendees count updated successfully:', result);
        res.send({ message: 'Successfully registered for the event!' });
      });
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

    const insertQuery = 'INSERT INTO registration (user_id, event_id) VALUES (?, ?)';
    db.query(insertQuery, [userId, eventId], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }

      const updateQuery = 'UPDATE events SET attendees_count = attendees_count + 1 WHERE id = ?';
      db.query(updateQuery, [eventId], (err) => {
        if (err) {
          console.error('Error updating attendees count:', err);
          return res.status(500).send({ message: 'Error updating attendees count.', error: err });
        }

        res.send({ message: 'You have been marked as attending this event!' });
      });
    });
  });
};

const removeAttendance = (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const checkEventQuery = 'SELECT attendees_count FROM events WHERE id = ?';
  db.query(checkEventQuery, [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    const attendeesCount = results[0].attendees_count;

    if (attendeesCount <= 0) {
      return res.status(400).send({ message: 'Cannot remove attendance. No attendees to remove.' });
    }

    const query = 'DELETE FROM registration WHERE user_id = ? AND event_id = ?';
    db.query(query, [userId, eventId], (err, result) => {
      if (err) {
        console.error('Error removing registration:', err);
        return res.status(500).send({ message: 'Error removing attendance.', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send({ message: 'No attendance record found.' });
      }

      const updateQuery = 'UPDATE events SET attendees_count = attendees_count - 1 WHERE id = ?';
      db.query(updateQuery, [eventId], (err) => {
        if (err) {
          console.error('Error updating attendees count:', err);
          return res.status(500).send({ message: 'Error updating attendees count.', error: err });
        }

        res.send({ message: 'You are no longer attending this event.' });
      });
    });
  });
};

module.exports = { createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance };

