const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/:userId', userController.getUserDetails);
router.get('/:userId/attendance', userController.getAttendanceStatus);

module.exports = router;