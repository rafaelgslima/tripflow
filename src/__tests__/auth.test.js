const request = require('supertest');
const { createApp } = require('../app');
const { resetUsers } = require('../users');

const app = createApp();

beforeEach(() => {
  resetUsers();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'User registered successfully' });
  });

  it('returns 409 when username is already taken', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'anotherpass' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Username already taken');
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });
  });

  it('returns a JWT token on successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid username or password');
  });

  it('returns 401 for unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid username or password');
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
