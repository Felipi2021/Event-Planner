const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:userId', userController.getUserDetails);
router.get('/:userId/favorites', verifyToken, userController.getFavorites);
router.get('/:userId/attendance', userController.getAttendanceStatus);

module.exports = router;