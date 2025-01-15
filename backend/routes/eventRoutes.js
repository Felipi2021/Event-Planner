const express = require('express');
const { createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance } = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', createEvent);
router.get('/', getAllEvents);
router.post('/:id/register', registerForEvent);
router.post('/:id/attend', verifyToken, markAttendance);
router.delete('/:id/attend', verifyToken, removeAttendance);

module.exports = router;

