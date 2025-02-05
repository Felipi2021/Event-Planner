const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const secretKey = process.env.JWT_SECRET;

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

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    console.log('Registering user:', { username, email, image });
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, image) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, image], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }
      res.status(201).send({ message: 'User registered successfully!' });
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send({ message: 'Internal server error', error: err });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ message: 'User not found!' });
    } else {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) return res.status(401).send({ message: 'Invalid credentials!' });
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
        res.send({ token, userId: user.id }); 
      });
    }
  });
};

const getUserDetails = (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT username, email, image FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ message: 'User not found!' });
    }
    res.send(results[0]);
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

module.exports = { register: [upload.single('image'), register], login, getUserDetails, getAttendanceStatus };