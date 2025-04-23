const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { getCommentCount, addRating, getAverageRating } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:userId', userController.getUserDetails);
router.post('/rate', verifyToken, addRating); 
router.get('/:userId/comments/count', getCommentCount);
router.get('/:userId/average-rating', getAverageRating);
router.put('/:userId/description', verifyToken, userController.updateDescription);
router.get('/:userId/favorites', verifyToken, userController.getFavorites);
router.get('/:userId/attendance', userController.getAttendanceStatus);
router.get('/:userId/favorites', verifyToken, (req, res) => {
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
  });
  
module.exports = router;