const request = require('supertest');
const app = require('../src/server');
const { sequelize, Owner, Property } = require('../src/models');
const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/jwt');

describe('Owner Endpoints', () => {
  let adminToken;
  let agentToken;
  let ownerId;

  beforeAll(async () => {
    // Create test users for authentication
    const admin = await User.create({
      email: 'admin-owner-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const agent = await User.create({
      email: 'agent-owner-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Agent',
      lastName: 'User',
      role: 'agent'
    });

    adminToken = generateAccessToken(admin.id, admin.email, admin.role);
    agentToken = generateAccessToken(agent.id, agent.email, agent.role);
  });

  afterAll(async () => {
    // Clean up test data
    await Owner.destroy({ where: { email: 'testowner@test.com' } });
    await Owner.destroy({ where: { email: 'updatedowner@test.com' } });
    await User.destroy({ where: { email: 'admin-owner-test@test.com' } });
    await User.destroy({ where: { email: 'agent-owner-test@test.com' } });
    await sequelize.close();
  });

  describe('POST /api/owners', () => {
    it('should create a new owner with admin token', async () => {
      const ownerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'testowner@test.com',
        phone: '+35621234567',
        mobile: '+35699123456',
        city: 'Valletta',
        country: 'Malta'
      };

      const response = await request(app)
        .post('/api/owners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ownerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(ownerData.email);
      ownerId = response.body.data.id;
    });

    it('should fail to create owner without authentication', async () => {
      const ownerData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com'
      };

      await request(app)
        .post('/api/owners')
        .send(ownerData)
        .expect(401);
    });

    it('should fail with duplicate email', async () => {
      const ownerData = {
        firstName: 'Duplicate',
        lastName: 'Owner',
        email: 'testowner@test.com'
      };

      const response = await request(app)
        .post('/api/owners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(ownerData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/owners', () => {
    it('should get all owners with authentication', async () => {
      const response = await request(app)
        .get('/api/owners')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('owners');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.owners)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/owners')
        .expect(401);
    });
  });

  describe('GET /api/owners/:id', () => {
    it('should get a single owner by ID', async () => {
      const response = await request(app)
        .get(`/api/owners/${ownerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(ownerId);
      expect(response.body.data.email).toBe('testowner@test.com');
    });

    it('should return 404 for non-existent owner', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/owners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/owners/:id', () => {
    it('should update an owner', async () => {
      const updateData = {
        email: 'updatedowner@test.com',
        city: 'Sliema'
      };

      const response = await request(app)
        .put(`/api/owners/${ownerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.city).toBe(updateData.city);
    });

    it('should fail to update non-existent owner', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .put(`/api/owners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ city: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/owners/:id', () => {
    it('should delete an owner', async () => {
      const response = await request(app)
        .delete(`/api/owners/${ownerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should fail to delete non-existent owner', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/owners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
