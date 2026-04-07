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
let promotionSchemaEnsured = false;
let postingPermissionsSchemaEnsured = false;

const PROMOTION_COSTS = {
  0: 0,
  3: 7,
  7: 9,
  10: 10,
  30: 15,
};

const ensurePromotionSchema = async () => {
  if (promotionSchemaEnsured) return;

  const ensureColumn = async (table, column, definition) => {
    const exists = await new Promise((resolve, reject) => {
      db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column], (err, results) => {
        if (err) return reject(err);
        resolve(Array.isArray(results) && results.length > 0);
      });
    });

    if (!exists) {
      await new Promise((resolve, reject) => {
        db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  };

  await ensureColumn('users', 'balance', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
  await ensureColumn('events', 'promotion_days', 'INT NOT NULL DEFAULT 0');
  await ensureColumn('events', 'promotion_cost', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
  await ensureColumn('events', 'promoted_until', 'DATETIME NULL');
  await ensureColumn('events', 'latitude', 'DECIMAL(10,7) NULL');
  await ensureColumn('events', 'longitude', 'DECIMAL(10,7) NULL');
  promotionSchemaEnsured = true;
};

const queryAsync = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const ensurePostingPermissionsSchema = async () => {
  if (postingPermissionsSchemaEnsured) return;
  const modeColumnExists = await queryAsync("SHOW COLUMNS FROM groups LIKE 'post_permission_mode'");
  if (!Array.isArray(modeColumnExists) || modeColumnExists.length === 0) {
    await queryAsync("ALTER TABLE groups ADD COLUMN post_permission_mode VARCHAR(32) NOT NULL DEFAULT 'all_members'");
  }
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS group_post_permissions (
      group_id INT NOT NULL,
      user_id INT NOT NULL,
      PRIMARY KEY (group_id, user_id)
    )
  `);
  postingPermissionsSchemaEnsured = true;
};

const createEvent = (req, res) => {
  const createEventAsync = async () => {
    try {
    await ensurePromotionSchema();
    await ensurePostingPermissionsSchema();
    const { title, description, date, location, capacity, group_id, promotionDays, latitude, longitude } = req.body;
    const normalizedLatitude = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
    const normalizedLongitude = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;
    const image = req.file ? req.file.filename : null;
    const created_by = req.user.id;
    const selectedPromotionDays = Number(promotionDays || 0);
    const promotionCost = PROMOTION_COSTS[selectedPromotionDays];
    if (promotionCost === undefined) {
      return res.status(400).send({ message: 'Nieprawidlowa opcja promocji.' });
    }

    const normalizedGroupId = group_id ? Number(group_id) : null;
    const promotedUntil = selectedPromotionDays > 0
      ? new Date(Date.now() + (selectedPromotionDays * 24 * 60 * 60 * 1000))
      : null;

    if (!title || !description || !date || !location || !capacity) {
      return res.status(400).send({ message: 'All fields are required.' });
    }

    if (normalizedGroupId) {
      const groups = await queryAsync('SELECT id, creator_id, post_permission_mode FROM groups WHERE id = ?', [normalizedGroupId]);
      if (!groups.length) {
        return res.status(404).send({ message: 'Group not found.' });
      }
      const group = groups[0];
      const isCreator = Number(group.creator_id) === Number(created_by);
      const memberRows = await queryAsync(
        "SELECT user_id FROM group_memberships WHERE group_id = ? AND user_id = ? AND status = 'joined'",
        [normalizedGroupId, created_by]
      );
      const isJoinedMember = memberRows.length > 0;
      if (!isCreator && !isJoinedMember) {
        return res.status(403).send({ message: 'Musisz nalezec do grupy, aby dodawac posty.' });
      }
      if ((group.post_permission_mode || 'all_members') === 'selected_members' && !isCreator) {
        const allowedRows = await queryAsync(
          'SELECT user_id FROM group_post_permissions WHERE group_id = ? AND user_id = ?',
          [normalizedGroupId, created_by]
        );
        if (!allowedRows.length) {
          return res.status(403).send({ message: 'Tworca grupy ograniczyl mozliwosc dodawania postow.' });
        }
      }
    }

    db.getConnection((connectionError, connection) => {
      if (connectionError) {
        return res.status(500).send({ message: 'Failed to create event.', error: connectionError });
      }

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          connection.release();
          return res.status(500).send({ message: 'Failed to create event.', error: transactionError });
        }

        let remainingBalance = null;

        const continueAfterBalance = () => {
          const query = `
            INSERT INTO events (
              title, description, date, location, capacity, created_by, image, group_id, promotion_days, promotion_cost, promoted_until, latitude, longitude
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          connection.query(
            query,
            [title, description, date, location, capacity, created_by, image, normalizedGroupId, selectedPromotionDays, promotionCost, promotedUntil, normalizedLatitude, normalizedLongitude],
            (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send({ message: 'Failed to create event.', error: err });
                });
              }

              connection.commit((commitErr) => {
                connection.release();
                if (commitErr) {
                  return res.status(500).send({ message: 'Failed to finalize event creation.', error: commitErr });
                }

                if (normalizedGroupId) {
                  const getNamesQuery = `SELECT u.username AS creator_name, g.name AS group_name FROM users u, groups g WHERE u.id = ? AND g.id = ?`;
                  db.query(getNamesQuery, [created_by, normalizedGroupId], (err3, results) => {
                    if (!err3 && results && results[0]) {
                      const creatorName = results[0].creator_name;
                      const groupName = results[0].group_name;
                      const notificationQuery = `INSERT INTO notifications (user_id, message, seen, created_at) SELECT user_id, CONCAT('New event from user ', ?, ' in group ', ?) as message, 0, NOW() FROM group_memberships WHERE group_id = ? AND user_id != ?`;
                      db.query(notificationQuery, [creatorName, groupName, normalizedGroupId, created_by], (err2) => {
                        if (err2) {
                          console.error('Failed to notify group members:', err2);
                        }
                      });
                    } else {
                      console.error('Failed to fetch creator or group name:', err3);
                    }
                  });
                }

                res.status(201).send({
                  message: 'Event created successfully!',
                  chargedAmount: promotionCost,
                  remainingBalance,
                });
              });
            }
          );
        };

        if (promotionCost > 0) {
          connection.query(
            'UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?',
            [promotionCost, created_by, promotionCost],
            (balanceErr, balanceResult) => {
              if (balanceErr) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).send({ message: 'Failed to process promotion.', error: balanceErr });
                });
              }

              if (!balanceResult || balanceResult.affectedRows === 0) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(400).send({ message: 'Brak srodkow w balansie na promowanie wydarzenia.' });
                });
              }
              connection.query(
                'SELECT balance FROM users WHERE id = ?',
                [created_by],
                (balanceReadErr, balanceRows) => {
                  if (balanceReadErr) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).send({ message: 'Failed to process promotion.', error: balanceReadErr });
                    });
                  }
                  remainingBalance = Number(balanceRows?.[0]?.balance ?? 0);
                  continueAfterBalance();
                }
              );
            }
          );
          return;
        }

        continueAfterBalance();
      });
    });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err });
  }
  };

  createEventAsync();
};

const getAllEvents = (req, res) => {
  const userId = req.user.id;
  const { created_by } = req.query;
  let query = `
    SELECT events.*, users.username AS created_by_username,
      CASE
        WHEN events.promoted_until IS NOT NULL AND events.promoted_until > NOW() THEN 1
        ELSE 0
      END AS is_promoted_active
    FROM events
    LEFT JOIN users ON events.created_by = users.id
    INNER JOIN group_memberships gm ON gm.group_id = events.group_id
      AND gm.user_id = ?
      AND gm.status = 'joined'
  `;
  const queryParams = [userId];

  if (created_by) {
    query += ' WHERE events.created_by = ?';
    queryParams.push(created_by);
  }

  query += `
    ORDER BY
      CASE
        WHEN events.promoted_until IS NOT NULL AND events.promoted_until > NOW() THEN 1
        ELSE 0
      END DESC,
      events.promoted_until DESC,
      events.date DESC
  `;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send(results);
  });
};
const getEventById = (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  const query = `
    SELECT events.*, users.username AS created_by_username
    FROM events
    LEFT JOIN users ON events.created_by = users.id
    INNER JOIN group_memberships gm ON gm.group_id = events.group_id
      AND gm.user_id = ?
      AND gm.status = 'joined'
    WHERE events.id = ?
  `;

  db.query(query, [userId, eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event details:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.send(results[0]); 
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

const deleteEvent = (req, res) => {
  const eventId = req.params.id;
  
  // Check if the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Only admins can delete events' });
  }

  // First delete related records (comments and registrations)
  const deleteCommentsQuery = 'DELETE FROM comments WHERE event_id = ?';
  db.query(deleteCommentsQuery, [eventId], (err) => {
    if (err) {
      console.error('Error deleting comments:', err);
      return res.status(500).send({ message: 'Failed to delete event comments', error: err });
    }

    const deleteRegistrationsQuery = 'DELETE FROM registration WHERE event_id = ?';
    db.query(deleteRegistrationsQuery, [eventId], (err) => {
      if (err) {
        console.error('Error deleting registrations:', err);
        return res.status(500).send({ message: 'Failed to delete event registrations', error: err });
      }

      // Finally delete the event
      const deleteEventQuery = 'DELETE FROM events WHERE id = ?';
      db.query(deleteEventQuery, [eventId], (err) => {
        if (err) {
          console.error('Error deleting event:', err);
          return res.status(500).send({ message: 'Failed to delete event', error: err });
        }

        res.status(200).send({ message: 'Event deleted successfully' });
      });
    });
  });
};

const getEventsWithCommentsForAdmin = (req, res) => {
  // Check if the user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Only admins can access this endpoint' });
  }

  // First get all events
  const eventsQuery = `
    SELECT events.*, users.username AS created_by_username
    FROM events
    LEFT JOIN users ON events.created_by = users.id
    ORDER BY events.date DESC
  `;
  
  db.query(eventsQuery, async (err, events) => {
    if (err) {
      console.error('Error fetching events for admin:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    // Then get all comments
    const commentsQuery = `
      SELECT comments.*, events.title AS event_title, users.username
      FROM comments
      JOIN events ON comments.event_id = events.id
      JOIN users ON comments.user_id = users.id
      ORDER BY comments.created_at DESC
    `;

    db.query(commentsQuery, (err, comments) => {
      if (err) {
        console.error('Error fetching comments for admin:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }

      res.status(200).send({ 
        events,
        comments
      });
    });
  });
};

module.exports = {upload, getEventById, markFavorite, createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance, deleteEvent, getEventsWithCommentsForAdmin };

