const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// This will ensure tests can properly set the secret key
const getSecretKey = () => process.env.JWT_SECRET || 'default-secret-key-for-development';

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
let userBalanceSchemaEnsured = false;

const ensureUserBalanceSchema = async () => {
  if (userBalanceSchemaEnsured) return;

  const hasBalanceColumn = await new Promise((resolve, reject) => {
    db.query("SHOW COLUMNS FROM users LIKE 'balance'", (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) && results.length > 0);
    });
  });

  if (!hasBalanceColumn) {
    await new Promise((resolve, reject) => {
      db.query('ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  const hasStoryColumn = await new Promise((resolve, reject) => {
    db.query("SHOW COLUMNS FROM users LIKE 'story_video'", (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) && results.length > 0);
    });
  });

  if (!hasStoryColumn) {
    await new Promise((resolve, reject) => {
      db.query('ALTER TABLE users ADD COLUMN story_video VARCHAR(255) NULL', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  await new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS user_stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        video_filename VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });

  const storyIdColumn = await new Promise((resolve, reject) => {
    db.query("SHOW COLUMNS FROM user_stories LIKE 'id'", (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) ? results[0] : null);
    });
  });

  const storyPrimaryKey = await new Promise((resolve, reject) => {
    db.query("SHOW INDEX FROM user_stories WHERE Key_name = 'PRIMARY'", (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) && results.length > 0);
    });
  });

  const needsRebuild = !storyIdColumn || !(storyIdColumn.Extra || '').includes('auto_increment') || !storyPrimaryKey;

  if (needsRebuild) {
    try {
      if (!storyPrimaryKey) {
        await new Promise((resolve, reject) => {
          db.query('ALTER TABLE user_stories ADD PRIMARY KEY (id)', (err) => (err ? reject(err) : resolve()));
        });
      }
      if (!storyIdColumn || !(storyIdColumn.Extra || '').includes('auto_increment')) {
        await new Promise((resolve, reject) => {
          db.query('ALTER TABLE user_stories MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT', (err) => (err ? reject(err) : resolve()));
        });
      }
    } catch (alterErr) {
      console.error('Direct user_stories ALTER failed, rebuilding table:', alterErr);
      await new Promise((resolve, reject) => {
        db.query(
          `CREATE TABLE IF NOT EXISTS user_stories_fixed (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            video_filename VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          (err) => (err ? reject(err) : resolve())
        );
      });
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO user_stories_fixed (user_id, video_filename, created_at)
           SELECT user_id, video_filename, COALESCE(created_at, NOW()) FROM user_stories`,
          (err) => (err ? reject(err) : resolve())
        );
      });
      await new Promise((resolve, reject) => db.query('DROP TABLE user_stories', (err) => (err ? reject(err) : resolve())));
      await new Promise((resolve, reject) => db.query('RENAME TABLE user_stories_fixed TO user_stories', (err) => (err ? reject(err) : resolve())));
    }
  }

  userBalanceSchemaEnsured = true;
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    console.log('Starting registration process for:', email);

    const emailCheckQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(emailCheckQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error during email check:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }

      if (results.length > 0) {
        console.log('Email already exists:', email);
        return res.status(400).send({ message: 'Email is already in use.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (username, email, password, image, created_at, is_admin, is_banned, ban_reason) VALUES (?, ?, ?, ?, NOW(), 0, 0, NULL)';
      db.query(query, [username, email, hashedPassword, image], (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log('Duplicate email error:', email);
            return res.status(400).send({ message: 'Email is already in use.' });
          }

          console.error('Database error during user insertion:', err);
          return res.status(500).send({ message: 'Database error', error: err });
        }

        console.log('User registered successfully:', email);
        res.status(201).send({ message: 'User registered successfully!' });
      });
    });
  } catch (err) {
    console.error('Unexpected error during registration:', err);
    res.status(500).send({ message: 'Internal server error', error: err });
  }
};
const getCommentCount = (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT COUNT(*) AS count FROM comments WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching comment count:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send({ count: results[0].count });
  });
};

const updateDescription = (req, res) => {
  const userId = req.params.userId;
  const { description } = req.body;

  const query = 'UPDATE users SET description = ? WHERE id = ?';
  db.query(query, [description, userId], (err) => {
    if (err) {
      console.error('Error updating description:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send({ message: 'Description updated successfully!' });
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(userQuery, [email], async (err, results) => {
      if (err) return res.status(500).send({ message: 'Database error' });
      if (results.length === 0) return res.status(404).send({ message: 'User not found' });

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).send({ message: 'Invalid credentials' });

      
      if (user.is_banned) {
        return res.status(403).send({ 
          message: 'Account banned', 
          isBanned: true, 
          banReason: user.ban_reason || 'No reason provided'
        });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          isAdmin: user.is_admin === 1
        }, 
        getSecretKey(), 
        { expiresIn: '1h' }
      );
      
      res.status(200).send({ 
        token, 
        userId: user.id, 
        isAdmin: user.is_admin === 1 
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

const addRating = (req, res) => {
  const { ratedId, rating } = req.body;
  const raterId = req.user.id; 

  if (!ratedId || !rating) {
    return res.status(400).send({ message: 'Rated user ID and rating are required.' });
  }

  const query = `
    INSERT INTO ratings (rater_id, rated_id, rating, created_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;
  db.query(query, [raterId, ratedId, rating], (err) => {
    if (err) {
      console.error('Error adding rating:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send({ message: 'Rating submitted successfully!' });
  });
};

const getAverageRating = (req, res) => {
  const ratedId = req.params.userId;

  const query = `
    SELECT AVG(rating) AS averageRating
    FROM ratings
    WHERE rated_id = ?
  `;
  db.query(query, [ratedId], (err, results) => {
    if (err) {
      console.error('Error fetching average rating:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    const averageRating = results[0].averageRating || 0;
    res.send({ averageRating: parseFloat(averageRating) });
  });
};

const getUserDetails = (req, res) => {
  const userId = req.params.userId;
  ensureUserBalanceSchema()
    .then(() => {
      const query = 'SELECT username, email, image, created_at, description, balance, story_video FROM users WHERE id = ?';
      db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).send({ message: 'User not found!' });
        }
        res.send(results[0]);
      });
    })
    .catch((error) => {
      console.error('Error ensuring user balance schema:', error);
      res.status(500).send({ message: 'Database error', error });
    });
};

const uploadStory = async (req, res) => {
  const userId = Number(req.params.userId);
  const requesterId = Number(req.user?.id);
  if (!requesterId || requesterId !== userId) {
    return res.status(403).send({ message: 'Brak uprawnien do dodania story na tym koncie.' });
  }

  if (!req.file) {
    return res.status(400).send({ message: 'Brak pliku story.' });
  }

  try {
    await ensureUserBalanceSchema();
    db.query('INSERT INTO user_stories (user_id, video_filename) VALUES (?, ?)', [userId, req.file.filename], (insertErr) => {
      if (insertErr) {
        console.error('Story queue insert failed, fallback to legacy story_video:', insertErr);
      }
      db.query('UPDATE users SET story_video = ? WHERE id = ?', [req.file.filename, userId], (err, result) => {
        if (err) {
          return res.status(500).send({ message: 'Database error', error: err });
        }
        if (!result || result.affectedRows === 0) {
          return res.status(404).send({ message: 'User not found!' });
        }
        return res.send({
          message: 'Story zapisane.',
          storyVideo: req.file.filename,
          queued: !insertErr,
        });
      });
    });
  } catch (error) {
    return res.status(500).send({ message: 'Database error', error });
  }
};

const getUserStories = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).send({ message: 'Invalid user id.' });
  }

  try {
    await ensureUserBalanceSchema();
    db.query(
      `SELECT id, video_filename, created_at
       FROM user_stories
       WHERE user_id = ?
         AND created_at >= (NOW() - INTERVAL 24 HOUR)
       ORDER BY created_at ASC`,
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).send({ message: 'Database error', error: err });
        }
        return res.send(Array.isArray(rows) ? rows : []);
      }
    );
  } catch (error) {
    return res.status(500).send({ message: 'Database error', error });
  }
};

const topUpBalance = async (req, res) => {
  const userId = Number(req.params.userId);
  const requesterId = Number(req.user?.id);
  const amount = Number(req.body?.amount || 0);

  if (!requesterId || requesterId !== userId) {
    return res.status(403).send({ message: 'Brak uprawnien do doladowania tego konta.' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).send({ message: 'Nieprawidlowa kwota doladowania.' });
  }

  try {
    await ensureUserBalanceSchema();
    db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId], (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Database error', error: err });
      }
      if (!result || result.affectedRows === 0) {
        return res.status(404).send({ message: 'User not found!' });
      }
      db.query('SELECT balance FROM users WHERE id = ?', [userId], (readErr, rows) => {
        if (readErr) {
          return res.status(500).send({ message: 'Database error', error: readErr });
        }
        return res.send({ message: 'Balans doladowany.', balance: Number(rows?.[0]?.balance || 0) });
      });
    });
  } catch (error) {
    return res.status(500).send({ message: 'Database error', error });
  }
};
const getFavorites = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT events.*
    FROM favorites
    JOIN events ON favorites.event_id = events.id
    WHERE favorites.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching favorite events:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    res.send(results);
  });
};

const getAttendanceStatus = (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT event_id FROM registration WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    const attendanceStatus = results.reduce((acc, row) => {
      acc[row.event_id] = true;
      return acc;
    }, {});
    res.send(attendanceStatus);
  });
};


const banUser = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Unauthorized: Admin access required' });
  }

  const { userId, banReason } = req.body;
  
  const query = 'UPDATE users SET is_banned = 1, ban_reason = ? WHERE id = ?';
  db.query(query, [banReason, userId], (err, result) => {
    if (err) {
      console.error('Error banning user:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    res.send({ message: 'User has been banned successfully' });
  });
};


const unbanUser = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Unauthorized: Admin access required' });
  }

  const { userId } = req.body;
  
  const query = 'UPDATE users SET is_banned = 0, ban_reason = NULL WHERE id = ?';
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error unbanning user:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    res.send({ message: 'User has been unbanned successfully' });
  });
};


const getAllUsers = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({ message: 'Unauthorized: Admin access required' });
  }
  
  const query = 'SELECT id, username, email, image, created_at, is_admin, is_banned, ban_reason FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }
    
    res.send(results);
  });
};


const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const adminSecret = req.body.adminSecret;
  
  
  if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).send({ message: 'Invalid admin secret key' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, created_at, is_admin, is_banned, ban_reason) VALUES (?, ?, ?, NOW(), 1, 0, NULL)';
    
    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.error('Error creating admin account:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }
      
      res.status(201).send({ message: 'Admin account created successfully!' });
    });
  } catch (err) {
    console.error('Error creating admin account:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = { getCommentCount, addRating, getAverageRating, updateDescription, register: [upload.single('image'), register], uploadStory: [upload.single('story'), uploadStory], getUserStories, getFavorites, login, getUserDetails, topUpBalance, getAttendanceStatus, banUser, unbanUser, getAllUsers, createAdmin };