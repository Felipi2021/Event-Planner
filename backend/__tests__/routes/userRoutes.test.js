const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const userController = require('../../controllers/userController');
const userRoutes = require('../../routes/userRoutes');
const { verifyToken } = require('../../middleware/authMiddleware');

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 1, isAdmin: false };
    next();
  }),
  verifyAdmin: jest.fn((req, res, next) => next())
}));

// Mock controllers
jest.mock('../../controllers/userController', () => ({
  register: jest.fn((req, res) => res.status(201).send({ message: 'User registered' })),
  login: jest.fn((req, res) => res.status(200).send({ token: 'fake-token' })),
  getUserDetails: jest.fn((req, res) => res.status(200).send({ id: 1, username: 'testuser' })),
  updateDescription: jest.fn((req, res) => res.status(200).send({ message: 'Description updated' })),
  getFavorites: jest.fn((req, res) => res.status(200).send([{ id: 1, title: 'Event 1' }])),
  getAttendanceStatus: jest.fn((req, res) => res.status(200).send({})),
  createAdmin: jest.fn((req, res) => res.status(201).send({ message: 'Admin created' })),
  getAllUsers: jest.fn((req, res) => res.status(200).send([])),
  banUser: jest.fn((req, res) => res.status(200).send({ message: 'User banned' })),
  unbanUser: jest.fn((req, res) => res.status(200).send({ message: 'User unbanned' })),
  getCommentCount: jest.fn((req, res) => res.status(200).send({ count: 0 })),
  addRating: jest.fn((req, res) => res.status(200).send({ message: 'Rating added' })),
  getAverageRating: jest.fn((req, res) => res.status(200).send({ average: 0 }))
}));

// Mock dla db.query w przypadku bezpośredniego użycia w userRoutes
jest.mock('../../models/db', () => ({
  query: jest.fn((query, params, callback) => {
    callback(null, [{ id: 1, title: 'Event 1' }]);
  })
}));

// Tworzenie aplikacji Express
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /register should call userController.register', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'Password123!' })
      .expect(201);
    
    expect(userController.register).toHaveBeenCalled();
  });

  test('POST /login should call userController.login', async () => {
    await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200);
    
    expect(userController.login).toHaveBeenCalled();
  });

  test('GET /:userId should call userController.getUserDetails', async () => {
    await request(app)
      .get('/api/users/1')
      .expect(200);
    
    expect(userController.getUserDetails).toHaveBeenCalled();
  });

  test('POST /rate should call addRating', async () => {
    await request(app)
      .post('/api/users/rate')
      .set('Authorization', 'Bearer fake-token')
      .send({ userId: 1, rating: 5 })
      .expect(200);
    
    expect(userController.addRating).toHaveBeenCalled();
    expect(verifyToken).toHaveBeenCalled();
  });

  test('GET /:userId/comments/count should call getCommentCount', async () => {
    await request(app)
      .get('/api/users/1/comments/count')
      .expect(200);
    
    expect(userController.getCommentCount).toHaveBeenCalled();
  });

  test('GET /:userId/average-rating should call getAverageRating', async () => {
    await request(app)
      .get('/api/users/1/average-rating')
      .expect(200);
    
    expect(userController.getAverageRating).toHaveBeenCalled();
  });

  test('PUT /:userId/description should call updateDescription', async () => {
    await request(app)
      .put('/api/users/1/description')
      .set('Authorization', 'Bearer fake-token')
      .send({ description: 'New description' })
      .expect(200);
    
    expect(userController.updateDescription).toHaveBeenCalled();
    expect(verifyToken).toHaveBeenCalled();
  });

  test('GET /:userId/attendance should call getAttendanceStatus', async () => {
    await request(app)
      .get('/api/users/1/attendance')
      .expect(200);
    
    expect(userController.getAttendanceStatus).toHaveBeenCalled();
  });

  test('GET /:userId/favorites with token should call getFavorites', async () => {
    const response = await request(app)
      .get('/api/users/1/favorites')
      .set('Authorization', 'Bearer fake-token')
      .expect(200);
    
    expect(userController.getFavorites).toHaveBeenCalled();
    expect(response.body).toEqual([{ id: 1, title: 'Event 1' }]);
    expect(verifyToken).toHaveBeenCalled();
  });

  test('POST /admin/create should call createAdmin', async () => {
    await request(app)
      .post('/api/users/admin/create')
      .send({ username: 'admin', email: 'admin@example.com', password: 'Admin123!', adminSecret: 'secret' })
      .expect(201);
    
    expect(userController.createAdmin).toHaveBeenCalled();
  });

  test('GET /admin/all-users should call getAllUsers', async () => {
    await request(app)
      .get('/api/users/admin/all-users')
      .set('Authorization', 'Bearer fake-token')
      .expect(200);
    
    expect(userController.getAllUsers).toHaveBeenCalled();
    expect(verifyToken).toHaveBeenCalled();
  });

  test('POST /admin/ban should call banUser', async () => {
    await request(app)
      .post('/api/users/admin/ban')
      .set('Authorization', 'Bearer fake-token')
      .send({ userId: 2, reason: 'Violation' })
      .expect(200);
    
    expect(userController.banUser).toHaveBeenCalled();
    expect(verifyToken).toHaveBeenCalled();
  });

  test('POST /admin/unban should call unbanUser', async () => {
    await request(app)
      .post('/api/users/admin/unban')
      .set('Authorization', 'Bearer fake-token')
      .send({ userId: 2 })
      .expect(200);
    
    expect(userController.unbanUser).toHaveBeenCalled();
    expect(verifyToken).toHaveBeenCalled();
  });
}); 