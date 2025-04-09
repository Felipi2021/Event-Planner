const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error('Authorization header is missing');
      return res.status(401).send({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
      console.error('Token is missing');
      return res.status(401).send({ message: 'Token is missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification error:', err.message); 
        return res.status(403).send({ message: 'Invalid or expired token' });
      }
      req.user = user; 
      console.log('Token verified successfully:', user); 
      next();
    });
  } catch (error) {
    console.error('Unexpected error in verifyToken middleware:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = { verifyToken };