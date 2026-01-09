const request = require('supertest');
const app = require('../src/server');
const { sequelize, Inquiry, Property, Owner, Agent } = require('../src/models');
const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/jwt');

describe('Inquiry Endpoints', () => {
  let adminToken;
  let agentToken;
  let propertyId;
  let agentId;
  let inquiryId;

  beforeAll(async () => {
    // Create test users
    const admin = await User.create({
      email: 'admin-inquiry-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const agentUser = await User.create({
      email: 'agent-inquiry-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Agent',
      lastName: 'User',
      role: 'agent'
    });

    adminToken = generateAccessToken(admin.id, admin.email, admin.role);
    agentToken = generateAccessToken(agentUser.id, agentUser.email, agentUser.role);

    // Create test owner
    const owner = await Owner.create({
      firstName: 'Test',
      lastName: 'Owner',
      email: 'inquiryowner@test.com',
      phone: '+35621234567'
    });

    // Create test agent
    const agent = await Agent.create({
      userId: agentUser.id,
      licenseNumber: 'INQ123',
      specialization: 'Residential'
    });
    agentId = agent.id;

    // Create test property
    const property = await Property.create({
      ownerId: owner.id,
      agentId: agent.id,
      title: 'Inquiry Test Property',
      propertyType: 'apartment',
      price: 200000,
      address: '123 Inquiry St',
      city: 'Valletta'
    });
    propertyId = property.id;
  });

  afterAll(async () => {
    // Clean up test data
    await Inquiry.destroy({ where: { clientEmail: 'client@test.com' } });
    await Inquiry.destroy({ where: { clientEmail: 'updated@test.com' } });
    await Property.destroy({ where: { title: 'Inquiry Test Property' } });
    await Agent.destroy({ where: { licenseNumber: 'INQ123' } });
    await Owner.destroy({ where: { email: 'inquiryowner@test.com' } });
    await User.destroy({ where: { email: 'admin-inquiry-test@test.com' } });
    await User.destroy({ where: { email: 'agent-inquiry-test@test.com' } });
    await sequelize.close();
  });

  describe('POST /api/inquiries', () => {
    it('should create a new inquiry (public access)', async () => {
      const inquiryData = {
        propertyId,
        agentId,
        clientName: 'John Client',
        clientEmail: 'client@test.com',
        clientPhone: '+35699123456',
        message: 'I am interested in viewing this property',
        inquiryType: 'viewing_request',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/inquiries')
        .send(inquiryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.clientEmail).toBe(inquiryData.clientEmail);
      inquiryId = response.body.data.id;
    });

    it('should fail with invalid property ID', async () => {
      const inquiryData = {
        propertyId: '00000000-0000-0000-0000-000000000000',
        clientName: 'Jane Client',
        clientEmail: 'jane@test.com',
        inquiryType: 'information_request'
      };

      const response = await request(app)
        .post('/api/inquiries')
        .send(inquiryData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const inquiryData = {
        propertyId,
        clientName: 'Invalid Email',
        clientEmail: 'invalid-email',
        inquiryType: 'general'
      };

      const response = await request(app)
        .post('/api/inquiries')
        .send(inquiryData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inquiries', () => {
    it('should get all inquiries with authentication', async () => {
      const response = await request(app)
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inquiries');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.inquiries)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/inquiries')
        .expect(401);
    });

    it('should filter inquiries by status', async () => {
      const response = await request(app)
        .get('/api/inquiries?status=new')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inquiries');
    });
  });

  describe('GET /api/inquiries/property/:propertyId', () => {
    it('should get inquiries by property', async () => {
      const response = await request(app)
        .get(`/api/inquiries/property/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inquiries');
      expect(response.body.data.inquiries.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/inquiries/property/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/inquiries/:id', () => {
    it('should get a single inquiry by ID', async () => {
      const response = await request(app)
        .get(`/api/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(inquiryId);
      expect(response.body.data.clientEmail).toBe('client@test.com');
      expect(response.body.data).toHaveProperty('property');
      expect(response.body.data).toHaveProperty('agent');
    });

    it('should return 404 for non-existent inquiry', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/inquiries/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/inquiries/:id', () => {
    it('should update an inquiry', async () => {
      const updateData = {
        status: 'contacted',
        clientEmail: 'updated@test.com',
        notes: 'Client contacted via phone'
      };

      const response = await request(app)
        .put(`/api/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.clientEmail).toBe(updateData.clientEmail);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .put(`/api/inquiries/${inquiryId}`)
        .send({ status: 'completed' })
        .expect(401);
    });
  });

  describe('DELETE /api/inquiries/:id', () => {
    it('should fail to delete with agent token', async () => {
      await request(app)
        .delete(`/api/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);
    });

    it('should delete an inquiry with admin token', async () => {
      const response = await request(app)
        .delete(`/api/inquiries/${inquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 when deleting non-existent inquiry', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/inquiries/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
