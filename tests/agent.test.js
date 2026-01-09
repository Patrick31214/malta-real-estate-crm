const request = require('supertest');
const app = require('../src/server');
const { sequelize, Agent } = require('../src/models');
const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/jwt');

describe('Agent Endpoints', () => {
  let adminToken;
  let agentToken;
  let userId;
  let agentId;

  beforeAll(async () => {
    // Create test users
    const admin = await User.create({
      email: 'admin-agent-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const testUser = await User.create({
      email: 'testagentuser@test.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Agent',
      role: 'agent'
    });

    adminToken = generateAccessToken(admin.id, admin.email, admin.role);
    agentToken = generateAccessToken(testUser.id, testUser.email, testUser.role);
    userId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data
    await Agent.destroy({ where: { licenseNumber: 'LIC123456' } });
    await Agent.destroy({ where: { licenseNumber: 'UPDATED123' } });
    await User.destroy({ where: { email: 'admin-agent-test@test.com' } });
    await User.destroy({ where: { email: 'testagentuser@test.com' } });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent with admin token', async () => {
      const agentData = {
        userId,
        licenseNumber: 'LIC123456',
        specialization: 'Commercial Real Estate',
        commissionRate: 5.5,
        phone: '+35621234567',
        mobile: '+35699123456',
        yearsExperience: 5
      };

      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(agentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.licenseNumber).toBe(agentData.licenseNumber);
      agentId = response.body.data.id;
    });

    it('should fail without admin token', async () => {
      const agentData = {
        userId: 'some-user-id',
        licenseNumber: 'LIC999999'
      };

      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(agentData)
        .expect(403);
    });

    it('should fail with duplicate license number', async () => {
      const agentData = {
        userId: 'some-other-user-id',
        licenseNumber: 'LIC123456'
      };

      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(agentData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/agents', () => {
    it('should get all agents (public access)', async () => {
      const response = await request(app)
        .get('/api/agents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('agents');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.agents)).toBe(true);
    });

    it('should filter agents by specialization', async () => {
      const response = await request(app)
        .get('/api/agents?specialization=Commercial')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('agents');
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should get a single agent by ID', async () => {
      const response = await request(app)
        .get(`/api/agents/${agentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(agentId);
      expect(response.body.data.licenseNumber).toBe('LIC123456');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('properties');
    });

    it('should return 404 for non-existent agent', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/agents/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('should update an agent', async () => {
      const updateData = {
        licenseNumber: 'UPDATED123',
        specialization: 'Luxury Properties',
        yearsExperience: 7
      };

      const response = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.licenseNumber).toBe(updateData.licenseNumber);
      expect(response.body.data.specialization).toBe(updateData.specialization);
    });

    it('should fail to update without authentication', async () => {
      await request(app)
        .put(`/api/agents/${agentId}`)
        .send({ specialization: 'Test' })
        .expect(401);
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete an agent with admin token', async () => {
      const response = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should fail to delete with agent token', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/agents/${fakeId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });
  });
});
