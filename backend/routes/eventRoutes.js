const express = require('express');
const {upload , getEventById, markFavorite, createEvent, getAllEvents, registerForEvent, markAttendance, removeAttendance } = require('../controllers/eventController');
const { getComments, addComment } = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, upload.single('image'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById); 
router.get('/:id/comments', getComments);
router.post('/:id/comments', verifyToken, addComment);
router.post('/:id/favorite', verifyToken, markFavorite);
router.post('/:id/register', registerForEvent);
router.post('/:id/attend', verifyToken, markAttendance);
router.delete('/:id/attend', verifyToken, removeAttendance);


module.exports = router;

