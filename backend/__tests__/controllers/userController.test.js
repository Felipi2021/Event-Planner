const { login, getUserDetails, getAverageRating, getCommentCount, updateDescription, addRating, getFavorites, getAttendanceStatus, banUser, unbanUser } = require('../../controllers/userController');
const db = require('../../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';

jest.mock('../../models/db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

console.error = jest.fn();

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login a regular user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUser = {
        id: 123,
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        is_admin: 0,
        is_banned: 0
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);

      const mockToken = 'fake-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      await login(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com'],
        expect.any(Function)
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');

      expect(jwt.sign).toHaveBeenCalledWith(
        { 
          id: 123, 
          email: 'test@example.com',
          isAdmin: false 
        }, 
        'test-secret-key', 
        { expiresIn: '1h' }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        token: mockToken,
        userId: 123,
        isAdmin: false
      });
    });

    it('should login an admin user successfully', async () => {
      const req = {
        body: {
          email: 'admin@example.com',
          password: 'adminPassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUser = {
        id: 456,
        email: 'admin@example.com',
        password: 'hashedPassword',
        username: 'adminuser',
        is_admin: 1,
        is_banned: 0
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);

      const mockToken = 'admin-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      await login(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['admin@example.com'],
        expect.any(Function)
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('adminPassword', 'hashedPassword');

      expect(jwt.sign).toHaveBeenCalledWith(
        { 
          id: 456, 
          email: 'admin@example.com',
          isAdmin: true 
        }, 
        'test-secret-key', 
        { expiresIn: '1h' }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        token: mockToken,
        userId: 456,
        isAdmin: true
      });
    });

    it('should reject login for banned user', async () => {
      const req = {
        body: {
          email: 'banned@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUser = {
        id: 789,
        email: 'banned@example.com',
        password: 'hashedPassword',
        username: 'banneduser',
        is_admin: 0,
        is_banned: 1,
        ban_reason: 'Violated community guidelines'
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);

      await login(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['banned@example.com'],
        expect.any(Function)
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');

      // Should not attempt to create a token for banned user
      expect(jwt.sign).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Account banned',
        isBanned: true,
        banReason: 'Violated community guidelines'
      });
    });

    it('should return 404 if user not found', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 401 if password is invalid', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUser = {
        id: 123,
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        is_admin: 0,
        is_banned: 0
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should handle database errors', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database connection error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      console.error = jest.fn();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('banUser', () => {
    it('should ban a user successfully when admin requests it', async () => {
      const req = {
        user: { isAdmin: true },
        body: {
          userId: 123,
          banReason: 'Spamming'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await banUser(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET is_banned = 1, ban_reason = ? WHERE id = ?',
        ['Spamming', 123],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ message: 'User has been banned successfully' });
    });

    it('should reject ban request from non-admin user', async () => {
      const req = {
        user: { isAdmin: false },
        body: {
          userId: 123,
          banReason: 'Spamming'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await banUser(req, res);

      expect(db.query).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized: Admin access required' });
    });

    it('should return 404 when trying to ban non-existent user', async () => {
      const req = {
        user: { isAdmin: true },
        body: {
          userId: 999,
          banReason: 'Spamming'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      await banUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('unbanUser', () => {
    it('should unban a user successfully when admin requests it', async () => {
      const req = {
        user: { isAdmin: true },
        body: { userId: 123 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await unbanUser(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET is_banned = 0, ban_reason = NULL WHERE id = ?',
        [123],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ message: 'User has been unbanned successfully' });
    });

    it('should reject unban request from non-admin user', async () => {
      const req = {
        user: { isAdmin: false },
        body: { userId: 123 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await unbanUser(req, res);

      expect(db.query).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized: Admin access required' });
    });
  });

  describe('getUserDetails', () => {
    it('should return user details successfully', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockUserDetails = {
        username: 'testuser',
        email: 'test@example.com',
        image: 'profile.jpg',
        created_at: '2023-01-01T00:00:00.000Z',
        description: 'Test user description'
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUserDetails]);
      });

      getUserDetails(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT username, email, image, created_at, description'),
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith(mockUserDetails);
    });

    it('should return 404 if user not found', () => {
      const req = {
        params: { userId: '999' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'User not found!' });
    });

    it('should handle database errors', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'User not found!' });
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating successfully', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockRatingResult = [{ averageRating: 4.5 }];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockRatingResult);
      });

      getAverageRating(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT AVG(rating) AS averageRating'),
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ averageRating: 4.5 });
    });

    it('should return 0 if no ratings exist', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockRatingResult = [{ averageRating: null }];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockRatingResult);
      });

      getAverageRating(req, res);

      expect(res.send).toHaveBeenCalledWith({ averageRating: 0 });
    });

    it('should handle database errors', () => {
      const req = {
        params: { userId: '123' }
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

      getAverageRating(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching average rating:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Database error', 
        error: dbError 
      });
    });
  });

  describe('getCommentCount', () => {
    it('should return comment count successfully', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockCommentCount = [{ count: 42 }];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockCommentCount);
      });

      getCommentCount(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) AS count FROM comments WHERE user_id = ?',
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ count: 42 });
    });

    it('should handle database errors when fetching comment count', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      getCommentCount(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching comment count:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Database error', 
        error: dbError 
      });
    });
  });

  describe('updateDescription', () => {
    it('should update user description successfully', () => {
      const req = {
        params: { userId: '123' },
        body: { description: 'New user description' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      updateDescription(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET description = ? WHERE id = ?',
        ['New user description', '123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ message: 'Description updated successfully!' });
    });

    it('should handle database errors when updating description', () => {
      const req = {
        params: { userId: '123' },
        body: { description: 'New user description' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      updateDescription(req, res);

      expect(console.error).toHaveBeenCalledWith('Error updating description:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Database error', 
        error: dbError 
      });
    });
  });

  describe('addRating', () => {
    it('should add or update a rating successfully', () => {
      const req = {
        body: { 
          ratedId: '456',
          rating: 4.5
        },
        user: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      addRating(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ratings'),
        ['123', '456', 4.5],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({ message: 'Rating submitted successfully!' });
    });

    it('should return 400 if required parameters are missing', () => {
      const req = {
        body: { ratedId: '456' },
        user: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      addRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Rated user ID and rating are required.' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle database errors when adding rating', () => {

      const req = {
        body: { 
          ratedId: '456',
          rating: 4.5
        },
        user: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      addRating(req, res);

      expect(console.error).toHaveBeenCalledWith('Error adding rating:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Database error', 
        error: dbError 
      });
    });
  });

  describe('getFavorites', () => {
    it('should return favorite events successfully', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockFavorites = [
        { id: 1, title: 'Event 1', description: 'Description 1' },
        { id: 2, title: 'Event 2', description: 'Description 2' }
      ];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockFavorites);
      });

      getFavorites(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT events.*'),
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith(mockFavorites);
    });

    it('should handle database errors when fetching favorites', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      getFavorites(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching favorite events:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        message: 'Database error', 
        error: dbError 
      });
    });
  });

  describe('getAttendanceStatus', () => {
    it('should return attendance status successfully', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockAttendanceData = [
        { event_id: 1 },
        { event_id: 3 },
        { event_id: 5 }
      ];

      const expectedAttendanceStatus = {
        '1': true,
        '3': true,
        '5': true
      };

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockAttendanceData);
      });

      getAttendanceStatus(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT event_id FROM registration WHERE user_id = ?',
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith(expectedAttendanceStatus);
    });

    it('should return empty object if no attendance records', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const mockAttendanceData = [];

      db.query.mockImplementation((query, params, callback) => {
        callback(null, mockAttendanceData);
      });

      getAttendanceStatus(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT event_id FROM registration WHERE user_id = ?',
        ['123'],
        expect.any(Function)
      );

      expect(res.send).toHaveBeenCalledWith({});
    });

    it('should handle database errors when fetching attendance status', () => {
      const req = {
        params: { userId: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const dbError = new Error('Database error');
      db.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      getAttendanceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(dbError);
    });
  });
}); 