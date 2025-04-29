const db = require('../models/db');

const getComments = (req, res) => {
    const eventId = req.params.id;
    const query = `
      SELECT comments.*, users.username, users.image AS userAvatar, users.id AS user_id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.event_id = ?
      ORDER BY comments.created_at ASC
    `;
    db.query(query, [eventId], (err, results) => {
      if (err) {
        console.error('Error fetching comments:', err);
        return res.status(500).send({ message: 'Database error', error: err });
      }
      res.send(results);
    });
  };

const addComment = (req, res) => {
    const { text } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    if (!text) {
        return res.status(400).send({ message: 'Comment text is required.' });
    }

    const query = 'INSERT INTO comments (event_id, user_id, text) VALUES (?, ?, ?)';
    db.query(query, [eventId, userId, text], (err, result) => {
        if (err) {
            console.error('Error adding comment:', err);
            return res.status(500).send({ message: 'Database error', error: err });
        }

        const fetchUserQuery = `
            SELECT username, COALESCE(image, 'default-avatar.png') AS userAvatar 
            FROM users 
            WHERE id = ?
        `;
        db.query(fetchUserQuery, [userId], (userErr, userResult) => {
            if (userErr) {
                console.error('Error fetching user details:', userErr);
                return res.status(500).send({ message: 'Database error', error: userErr });
            }

            const user = userResult[0];
            res.send({
                id: result.insertId,
                text,
                username: user.username,
                userAvatar: user.userAvatar,
                user_id: userId,
                created_at: new Date(), 
            });
        });
    });
};

const deleteComment = (req, res) => {
    const commentId = req.params.commentId;
    
    // Check if the user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).send({ message: 'Only admins can delete comments' });
    }
    
    const query = 'DELETE FROM comments WHERE id = ?';
    db.query(query, [commentId], (err, result) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).send({ message: 'Database error', error: err });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Comment not found' });
        }
        
        res.status(200).send({ message: 'Comment deleted successfully' });
    });
};

module.exports = { getComments, addComment, deleteComment };