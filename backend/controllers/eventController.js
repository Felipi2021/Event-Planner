const db = require('../models/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  },
});
const upload = multer({ storage });

const createEvent = (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;
    const image = req.file ? req.file.filename : null;
    const created_by = req.user.id; 

    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);
    console.log('User ID from token:', created_by);

    if (!title || !description || !date || !location || !capacity) {
      console.error('Validation failed. Missing fields:', { title, description, date, location, capacity });
      return res.status(400).send({ message: 'All fields are required.' });
    }

    const query = 'INSERT INTO events (title, description, date, location, capacity, created_by, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, date, location, capacity, created_by, image], (err) => {
      if (err) {
        console.error('Error inserting event into database:', err);
        return res.status(500).send({ message: 'Failed to create event.', error: err });
      }
      res.status(201).send({ message: 'Event created successfully!' });
    });
  } catch (err) {
    console.error('Unexpected error in createEvent:', err);
    res.status(500).send({ message: 'Internal server error', error: err });
  }
};

const getAllEvents = (req, res) => {
  const query = `
    SELECT events.*, users.username AS created_by_username
    FROM events
    LEFT JOIN users ON events.created_by = users.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send(results);
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

  console.log('Received userId:', userId);
  console.log('Received eventId:', eventId);

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const checkCapacityQuery = 'SELECT capacity, attendees_count FROM events WHERE id = ?';
  db.query(checkCapacityQuery, [eventId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Event not found.' });
    }

    const { capacity, attendees_count } = results[0];
    if (attendees_count >= capacity) {
      return res.status(400).send({ message: 'Event has reached its capacity.' });
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
const markFavorite = (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  if (!userId || !eventId) {
    return res.status(400).send({ message: 'User ID and Event ID are required.' });
  }

  const checkQuery = 'SELECT * FROM favorites WHERE user_id = ? AND event_id = ?';
  db.query(checkQuery, [userId, eventId], (err, results) => {
    if (err) {
      console.error('Error checking favorite:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    if (results.length > 0) {

      const deleteQuery = 'DELETE FROM favorites WHERE user_id = ? AND event_id = ?';
      db.query(deleteQuery, [userId, eventId], (err) => {
        if (err) {
          console.error('Error removing favorite:', err);
          return res.status(500).send({ message: 'Database error', error: err });
        }
        res.send({ message: 'Event unmarked as favorite!' });
      });
    } else {

      const insertQuery = 'INSERT INTO favorites (user_id, event_id) VALUES (?, ?)';
      db.query(insertQuery, [userId, eventId], (err) => {
        if (err) {
          console.error('Error marking favorite:', err);
          return res.status(500).send({ message: 'Database error', error: err });
        }
        res.send({ message: 'Event marked as favorite!' });
      });
    }
  });
};

module.exports = {upload, markFavorite, createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance };

