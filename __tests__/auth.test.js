const request = require('supertest');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const {
  generatePasswordResetToken,
  generateEmailVerificationToken
} = require('../src/utils/jwt');

// Mock the app without starting the server
const express = require('express');
const authRoutes = require('../src/routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  let testUser;
  let resetToken;
  let verificationToken;

  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Clean up and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123',
          firstName: 'Test',
          lastName: 'User',
          role: 'owner'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.verificationToken).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'owner'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'SecurePass123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'login@example.com',
        password: 'SecurePass123',
        firstName: 'Login',
        lastName: 'User',
        role: 'agent',
        isEmailVerified: true
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'reset@example.com',
        password: 'OldPassword123',
        role: 'owner'
      });
    });

    it('should generate password reset token for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'reset@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetToken).toBeDefined();

      // Verify token was saved to database
      const user = await User.findOne({ where: { email: 'reset@example.com' } });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
    });

    it('should return success even for non-existent email (security)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'resetpass@example.com',
        password: 'OldPassword123',
        role: 'owner'
      });

      resetToken = generatePasswordResetToken(testUser.id, testUser.email);
      testUser.resetPasswordToken = resetToken;
      testUser.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await testUser.save();
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePass456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify password was changed
      const user = await User.findByPk(testUser.id);
      const isValid = await user.comparePassword('NewSecurePass456');
      expect(isValid).toBe(true);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewSecurePass456'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'verify@example.com',
        password: 'Password123',
        role: 'owner',
        isEmailVerified: false
      });

      verificationToken = generateEmailVerificationToken(testUser.id, testUser.email);
      testUser.emailVerificationToken = verificationToken;
      testUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await testUser.save();
    });

    it('should verify email with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          token: verificationToken
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify email was marked as verified
      const user = await User.findByPk(testUser.id);
      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeNull();
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          token: 'invalid-token'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'logout@example.com',
        password: 'Password123',
        role: 'owner'
      });

      // Login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'Password123'
        });

      refreshToken = loginRes.body.data.refreshToken;
    });

    it('should logout successfully with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: refreshToken
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify refresh token was cleared
      const user = await User.findByPk(testUser.id);
      expect(user.refreshToken).toBeNull();
    });

    it('should fail with missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
