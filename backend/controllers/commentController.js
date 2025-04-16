const db = require('../models/db');

const getComments = (req, res) => {
    const eventId = req.params.id;
    const query = `
        SELECT comments.*, users.username
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

        const fetchUserQuery = 'SELECT username, image FROM users WHERE id = ?';
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
                userAvatar: user.image || 'default-avatar.png', 
            });
        });
    });
};

module.exports = { getComments, addComment };