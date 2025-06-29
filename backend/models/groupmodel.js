const db = require('./db');

const createGroup = (name, description, image, privacy, creator_id, callback) => {
  const query = 'INSERT INTO groups (name, description, image, privacy, creator_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, description, image, privacy, creator_id], callback);
};

const searchGroupsByName = (searchTerm, callback) => {
  const query = 'SELECT * FROM groups WHERE name LIKE ?';
  db.query(query, [`%${searchTerm}%`], callback);
};

const getGroupById = (groupId, callback) => {
  const query = 'SELECT * FROM groups WHERE id = ?';
  db.query(query, [groupId], callback);
};

const getGroupsForUser = (userId, callback) => {
  const query = `SELECT g.* FROM groups g
    JOIN group_memberships gm ON g.id = gm.group_id
    WHERE gm.user_id = ? AND gm.status = 'joined'`;
  db.query(query, [userId], callback);
};

const getAllGroupsWithMembership = (userId, callback) => {
  const query = `SELECT g.*, 
    CASE WHEN gm.status = 'joined' THEN 1 ELSE 0 END AS joined
    FROM groups g
    LEFT JOIN group_memberships gm ON g.id = gm.group_id AND gm.user_id = ?`;
  db.query(query, [userId], callback);
};

const getGroupsCreatedByUser = (userId, callback) => {
  const query = 'SELECT * FROM groups WHERE creator_id = ?';
  db.query(query, [userId], callback);
};

module.exports = {
  createGroup,
  searchGroupsByName,
  getGroupById,
  getGroupsForUser,
  getAllGroupsWithMembership,
  getGroupsCreatedByUser
}; 