const express = require('express');
const { register, login, getAttendanceStatus } = require('../controllers/userController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:userId/attendance', getAttendanceStatus);

module.exports = router;