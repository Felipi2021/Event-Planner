const groupModel = require('../models/groupmodel');
const groupMembership = require('../models/groupmembership');

// Create a new group
const createGroup = (req, res) => {
  const { name, description, privacy } = req.body;
  const image = req.file ? req.file.filename : null;
  const creator_id = req.user.id;
  groupModel.createGroup(name, description, image, privacy, creator_id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create group' });
    // Add creator as member
    groupMembership.joinGroup(creator_id, result.insertId, 'joined', (err2) => {
      if (err2) return res.status(500).json({ error: 'Group created but failed to add creator as member' });
      res.status(201).json({ message: 'Group created', groupId: result.insertId });
    });
  });
};

// Search groups by name
const searchGroups = (req, res) => {
  const { q } = req.query;
  groupModel.searchGroupsByName(q || '', (err, groups) => {
    if (err) return res.status(500).json({ error: 'Failed to search groups' });
    res.json(groups);
  });
};

// Join or request to join a group
const joinGroup = (req, res) => {
  const user_id = req.user.id;
  const { groupId } = req.body;
  groupModel.getGroupById(groupId, (err, groups) => {
    if (err || !groups.length) return res.status(404).json({ error: 'Group not found' });
    const group = groups[0];
    let status = 'joined';
    if (group.privacy === 'private') status = 'pending';
    groupMembership.joinGroup(user_id, groupId, status, (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to join/request group' });
      res.json({ message: status === 'joined' ? 'Joined group' : 'Request sent', status });
    });
  });
};

// Accept or reject a join request (creator only)
const handleRequest = (req, res) => {
  const creator_id = req.user.id;
  const { groupId, userId, action } = req.body; // action: 'accept' or 'reject'
  console.log('handleRequest called:', { groupId, userId, action });
  groupModel.getGroupById(groupId, (err, groups) => {
    if (err || !groups.length) {
      console.error('Group not found or error:', err);
      return res.status(404).json({ error: 'Group not found' });
    }
    const group = groups[0];
    if (group.creator_id !== creator_id) {
      console.error('Not authorized:', { creator_id, group_creator: group.creator_id });
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (action === 'accept') {
      groupMembership.updateMembershipStatus(userId, groupId, 'joined', (err2) => {
        if (err2) {
          console.error('Failed to accept request:', err2);
          return res.status(500).json({ error: 'Failed to accept request' });
        }
        res.json({ message: 'Request accepted' });
      });
    } else if (action === 'reject') {
      groupMembership.updateMembershipStatus(userId, groupId, 'rejected', (err2) => {
        if (err2) {
          console.error('Failed to reject request:', err2);
          return res.status(500).json({ error: 'Failed to reject request' });
        }
        res.json({ message: 'Request rejected' });
      });
    } else {
      console.error('Invalid action:', action);
      res.status(400).json({ error: 'Invalid action' });
    }
  });
};

// List groups for the current user
const getUserGroups = (req, res) => {
  const user_id = req.user.id;
  groupModel.getGroupsForUser(user_id, (err, groups) => {
    if (err) return res.status(500).json({ error: 'Failed to get user groups' });
    res.json(groups);
  });
};

// List pending requests for a group (creator only)
const getPendingRequests = (req, res) => {
  const creator_id = req.user.id;
  const { groupId } = req.params;
  groupModel.getGroupById(groupId, (err, groups) => {
    if (err || !groups.length) return res.status(404).json({ error: 'Group not found' });
    const group = groups[0];
    if (group.creator_id !== creator_id) return res.status(403).json({ error: 'Not authorized' });
    groupMembership.getPendingRequests(groupId, (err2, users) => {
      if (err2) return res.status(500).json({ error: 'Failed to get pending requests' });
      res.json(users);
    });
  });
};

// Get all groups with membership info
const getAllGroups = (req, res) => {
  const user_id = req.user.id;
  groupModel.getAllGroupsWithMembership(user_id, (err, groups) => {
    if (err) return res.status(500).json({ error: 'Failed to get groups' });
    res.json(groups);
  });
};

// Leave a group
const leaveGroup = (req, res) => {
  const user_id = req.user.id;
  const { groupId } = req.body;
  groupMembership.leaveGroup(user_id, groupId, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to leave group' });
    res.json({ message: 'Left group' });
  });
};

// Get groups created by the user (managed groups)
const getManagedGroups = (req, res) => {
  const user_id = req.user.id;
  groupModel.getGroupsCreatedByUser(user_id, (err, groups) => {
    if (err) return res.status(500).json({ error: 'Failed to get managed groups' });
    res.json(groups);
  });
};

// Get group join notifications for the user
const getUserNotifications = (req, res) => {
  const user_id = req.user.id;
  groupMembership.getUserNotifications(user_id, (err, notifications) => {
    if (err) return res.status(500).json({ error: 'Failed to get notifications' });
    console.log('Notifications for user', user_id, notifications);
    res.json(notifications);
  });
};

// Mark notifications as seen
const markNotificationsSeen = (req, res) => {
  const user_id = req.user.id;
  groupMembership.markNotificationsSeen(user_id, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to mark notifications as seen' });
    res.json({ message: 'Notifications marked as seen' });
  });
};

module.exports = {
  createGroup,
  searchGroups,
  joinGroup,
  handleRequest,
  getUserGroups,
  getPendingRequests,
  getAllGroups,
  leaveGroup,
  getManagedGroups,
  getUserNotifications,
  markNotificationsSeen
}; 