const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const secretKey = process.env.JWT_SECRET;

const register = (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send(err);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hash], (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'User registered successfully!' });
    });
  });
};
const login = (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err || results.length === 0){
        return res.status(404).send({ message: 'User not found!' });
    }
    else{
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) return res.status(401).send({ message: 'Invalid credentials!' });
            const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
            res.send({ token });
            return token;
        });
    }
  });
};

module.exports = { register, login };
