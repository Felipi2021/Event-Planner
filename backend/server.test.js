require('dotenv').config(); 
const request = require('supertest');
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const db = require('./models/db');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

let token; 

beforeAll(async () => {

  await request(app)
    .post('/api/users/register')
    .send({
      email: 'president@pessa.com',
      password: 'Krawat123!',
      username: 'ZSKuser',
    });


  const response = await request(app)
    .post('/api/users/login')
    .send({ email: 'president@pessa.com', password: 'Krawat123!' });

  token = response.body.token;
});

afterAll(() => {
  db.end(); 
});

describe('Backend API Tests', () => {
  test('GET /api/events should return a list of events', async () => {
    const response = await request(app).get('/api/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/users/register should register a new user and return a success message', async () => {
    const uniqueEmail = `zsk${Date.now()}@uczen.zsk.poznan.pl`; 
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: uniqueEmail,
        password: 'Kumigaming123!',
        username: 'NowyZSKuser',
      });
    expect(response.status).toBe(201); 
    expect(response.body.message).toBe('User registered successfully!');
  });

  test('POST /api/users/login should return a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'president@pessa.com', password: 'Krawat123!' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/events should create an event when authorized', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        description: 'This is a test event',
        date: '2025-05-01',
        location: 'Test City',
        capacity: 100,
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Event created successfully!');
  });
});