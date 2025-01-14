const express = require('express');
const { createEvent, getAllEvents, markAttendance, removeAttendance, registerForEvent} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', createEvent); 
router.get('/', getAllEvents);
router.post('/:id/register', registerForEvent); 
router.post('/:id/attend', verifyToken, markAttendance);
router.delete('/:id/attend', verifyToken, removeAttendance);
router.get('/', getAllEvents);

module.exports = router;



