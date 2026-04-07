const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/groups/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create group
router.post('/create', auth.verifyToken, upload.single('image'), groupController.createGroup);
// Search groups
router.get('/search', auth.verifyToken, groupController.searchGroups);
// Join/request to join group
router.post('/join', auth.verifyToken, groupController.joinGroup);
// Accept/reject join request
router.post('/handle-request', auth.verifyToken, groupController.handleRequest);
// Get user's groups
router.get('/my-groups', auth.verifyToken, groupController.getUserGroups);
// Get pending requests for a group (creator only)
router.get('/:groupId/pending', auth.verifyToken, groupController.getPendingRequests);
// Get current post permissions and members for a group (creator only)
router.get('/:groupId/post-permissions', auth.verifyToken, groupController.getGroupPostPermissions);
// Update who can post in a group (creator only)
router.put('/:groupId/post-permissions', auth.verifyToken, groupController.updateGroupPostPermissions);
// Get all groups (browse)
router.get('/all', auth.verifyToken, groupController.getAllGroups);
// Leave a group
router.post('/leave', auth.verifyToken, groupController.leaveGroup);
// Get groups managed/created by the user
router.get('/managed', auth.verifyToken, groupController.getManagedGroups);
// Get group join notifications for the user
router.get('/notifications', auth.verifyToken, groupController.getUserNotifications);
// Mark notifications as seen
router.post('/notifications/seen', auth.verifyToken, groupController.markNotificationsSeen);

module.exports = router; 