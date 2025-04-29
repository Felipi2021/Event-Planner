const { getComments, addComment, deleteComment } = require('../../controllers/commentController');
const db = require('../../models/db');


jest.mock('../../models/db', () => ({
  query: jest.fn()
}));

describe('Comment Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getComments', () => {
    it('should fetch comments for a specific event', () => {

      const req = {
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      const mockComments = [
        { id: 1, text: 'Great event!', username: 'user1', userAvatar: 'avatar1.png', user_id: 201 },
        { id: 2, text: 'Looking forward to it!', username: 'user2', userAvatar: 'avatar2.png', user_id: 202 }
      ];


      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockComments);
      });


      getComments(req, res);


      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT comments.*, users.username'),
        ['123'],
        expect.any(Function)
      );


      expect(res.send).toHaveBeenCalledWith(mockComments);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle database errors', () => {

      const req = {
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      const dbError = new Error('Database connection failed');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });


      console.error = jest.fn();


      getComments(req, res);


      expect(console.error).toHaveBeenCalledWith('Error fetching comments:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error',
        error: dbError
      });
    });
  });

  describe('addComment', () => {
    it('should add a comment successfully', () => {

      const req = {
        params: { id: '123' },
        body: { text: 'New comment test' },
        user: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      const insertResult = { insertId: 789 };
      const userResult = [{ username: 'testuser', userAvatar: 'user-avatar.png' }];


      db.query
        .mockImplementationOnce((query, params, callback) => {

          callback(null, insertResult);
        })
        .mockImplementationOnce((query, params, callback) => {

          callback(null, userResult);
        });


      addComment(req, res);


      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'INSERT INTO comments (event_id, user_id, text) VALUES (?, ?, ?)',
        ['123', '456', 'New comment test'],
        expect.any(Function)
      );


      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('SELECT username'),
        ['456'],
        expect.any(Function)
      );


      expect(res.send).toHaveBeenCalledWith({
        id: 789,
        text: 'New comment test',
        username: 'testuser',
        userAvatar: 'user-avatar.png',
        user_id: '456',
        created_at: expect.any(Date)
      });
    });

    it('should return 400 when text is missing', () => {

      const req = {
        params: { id: '123' },
        body: {},
        user: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      addComment(req, res);


      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Comment text is required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle database error when adding comment', () => {

      const req = {
        params: { id: '123' },
        body: { text: 'New comment test' },
        user: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      const dbError = new Error('Database connection failed');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });


      console.error = jest.fn();


      addComment(req, res);


      expect(console.error).toHaveBeenCalledWith('Error adding comment:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error',
        error: dbError
      });
    });

    it('should handle database error when fetching user details', () => {

      const req = {
        params: { id: '123' },
        body: { text: 'New comment test' },
        user: { id: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };


      const insertResult = { insertId: 789 };
      const userError = new Error('User fetch failed');

      db.query
        .mockImplementationOnce((query, params, callback) => {

          callback(null, insertResult);
        })
        .mockImplementationOnce((query, params, callback) => {

          callback(userError, null);
        });


      console.error = jest.fn();


      addComment(req, res);


      expect(console.error).toHaveBeenCalledWith('Error fetching user details:', userError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error',
        error: userError
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully when user is admin', () => {
      const req = {
        params: { commentId: '123' },
        user: { isAdmin: true }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const deleteResult = { affectedRows: 1 };
      db.query.mockImplementation((query, params, callback) => {
        callback(null, deleteResult);
      });

      deleteComment(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM comments WHERE id = ?',
        ['123'],
        expect.any(Function)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
    });

    it('should return 403 when user is not admin', () => {
      const req = {
        params: { commentId: '123' },
        user: { isAdmin: false }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'Only admins can delete comments' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 404 when comment is not found', () => {
      const req = {
        params: { commentId: '123' },
        user: { isAdmin: true }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const deleteResult = { affectedRows: 0 };
      db.query.mockImplementation((query, params, callback) => {
        callback(null, deleteResult);
      });

      deleteComment(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM comments WHERE id = ?',
        ['123'],
        expect.any(Function)
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Comment not found' });
    });

    it('should handle database errors', () => {
      const req = {
        params: { commentId: '123' },
        user: { isAdmin: true }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      console.error = jest.fn();

      deleteComment(req, res);

      expect(console.error).toHaveBeenCalledWith('Error deleting comment:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error', error: dbError });
    });
  });
}); 