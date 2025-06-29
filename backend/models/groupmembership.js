const db = require('./db');

const joinGroup = (user_id, group_id, status, callback) => {
  const query = 'INSERT INTO group_memberships (user_id, group_id, status, joined_at) VALUES (?, ?, ?, IF(? = \'joined\', NOW(), NULL)) ON DUPLICATE KEY UPDATE status = VALUES(status), joined_at = IF(VALUES(status) = \'joined\', NOW(), joined_at)';
  db.query(query, [user_id, group_id, status, status], callback);
};

const getGroupMembers = (group_id, callback) => {
  const query = `SELECT u.id, u.username, u.image, gm.status FROM users u
    JOIN group_memberships gm ON u.id = gm.user_id
    WHERE gm.group_id = ?`;
  db.query(query, [group_id], callback);
};

const getPendingRequests = (group_id, callback) => {
  const query = `SELECT u.id, u.username, u.image FROM users u
    JOIN group_memberships gm ON u.id = gm.user_id
    WHERE gm.group_id = ? AND gm.status = 'pending'`;
  db.query(query, [group_id], callback);
};

const updateMembershipStatus = (user_id, group_id, status, callback) => {
  const query = 'UPDATE group_memberships SET status = ?, joined_at = IF(? = \'joined\', NOW(), joined_at), seen = 0 WHERE user_id = ? AND group_id = ?';
  db.query(query, [status, status, user_id, group_id], callback);
};

const leaveGroup = (user_id, group_id, callback) => {
  const query = 'DELETE FROM group_memberships WHERE user_id = ? AND group_id = ?';
  db.query(query, [user_id, group_id], callback);
};

const getUserNotifications = (user_id, callback) => {
  const query = `
    SELECT 'group' as type, g.name as group_name, gm.status, gm.joined_at as created_at, NULL as message
    FROM group_memberships gm
    JOIN groups g ON gm.group_id = g.id
    WHERE gm.user_id = ? AND gm.status IN ('joined', 'rejected') AND (gm.seen IS NULL OR gm.seen = 0)
    UNION ALL
    SELECT 'event' as type, NULL as group_name, NULL as status, n.created_at, n.message
    FROM notifications n
    WHERE n.user_id = ? AND n.seen = 0
    ORDER BY created_at DESC
  `;
  db.query(query, [user_id, user_id], callback);
};

const markNotificationsSeen = (user_id, callback) => {
  const query1 = `UPDATE group_memberships SET seen = 1 WHERE user_id = ? AND status IN ('joined', 'rejected') AND (seen IS NULL OR seen = 0)`;
  const query2 = `UPDATE notifications SET seen = 1 WHERE user_id = ? AND seen = 0`;
  db.query(query1, [user_id], (err) => {
    if (err) return callback(err);
    db.query(query2, [user_id], callback);
  });
};

module.exports = {
  joinGroup,
  getGroupMembers,
  getPendingRequests,
  updateMembershipStatus,
  leaveGroup,
  getUserNotifications,
  markNotificationsSeen
}; 