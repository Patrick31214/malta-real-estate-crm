const request = require('supertest');
const app = require('../src/server');
const { sequelize, Property, Owner, Agent } = require('../src/models');
const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/jwt');

describe('Property Endpoints', () => {
  let adminToken;
  let agentToken;
  let propertyId;
  let ownerId;
  let agentId;

  beforeAll(async () => {
    // Create test users
    const admin = await User.create({
      email: 'admin-property-test@test.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const agentUser = await User.create({
      email: 'agent-property-test@test.com',
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
      email: 'propertyowner@test.com',
      phone: '+35621234567'
    });
    ownerId = owner.id;

    // Create test agent
    const agent = await Agent.create({
      userId: agentUser.id,
      licenseNumber: 'TEST123',
      specialization: 'Residential'
    });
    agentId = agent.id;
  });

  afterAll(async () => {
    // Clean up test data
    await Property.destroy({ where: { title: 'Test Property' } });
    await Property.destroy({ where: { title: 'Updated Property' } });
    await Agent.destroy({ where: { licenseNumber: 'TEST123' } });
    await Owner.destroy({ where: { email: 'propertyowner@test.com' } });
    await User.destroy({ where: { email: 'admin-property-test@test.com' } });
    await User.destroy({ where: { email: 'agent-property-test@test.com' } });
    await sequelize.close();
  });

  describe('POST /api/properties', () => {
    it('should create a new property with admin token', async () => {
      const propertyData = {
        ownerId,
        agentId,
        title: 'Test Property',
        description: 'A beautiful test property',
        propertyType: 'apartment',
        listingType: 'sale',
        status: 'available',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 120,
        address: '123 Test Street',
        city: 'Valletta',
        country: 'Malta'
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(propertyData.title);
      propertyId = response.body.data.id;
    });

    it('should fail without authentication', async () => {
      const propertyData = {
        ownerId,
        title: 'Unauthorized Property',
        propertyType: 'house',
        price: 300000,
        address: '456 Test Ave',
        city: 'Sliema'
      };

      await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect(401);
    });

    it('should fail with invalid property type', async () => {
      const propertyData = {
        ownerId,
        title: 'Invalid Property',
        propertyType: 'invalid_type',
        price: 300000,
        address: '789 Test Blvd',
        city: 'Sliema'
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(propertyData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/properties', () => {
    it('should get all properties (public access)', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.properties)).toBe(true);
    });

    it('should filter properties by city', async () => {
      const response = await request(app)
        .get('/api/properties?city=Valletta')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('properties');
    });

    it('should filter properties by price range', async () => {
      const response = await request(app)
        .get('/api/properties?minPrice=200000&maxPrice=300000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('properties');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get a single property by ID', async () => {
      const response = await request(app)
        .get(`/api/properties/${propertyId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(propertyId);
      expect(response.body.data.title).toBe('Test Property');
      expect(response.body.data).toHaveProperty('owner');
      expect(response.body.data).toHaveProperty('agent');
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/properties/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update a property', async () => {
      const updateData = {
        title: 'Updated Property',
        price: 275000,
        bedrooms: 4
      };

      const response = await request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(parseFloat(response.body.data.price)).toBe(updateData.price);
    });

    it('should fail to update without authentication', async () => {
      await request(app)
        .put(`/api/properties/${propertyId}`)
        .send({ price: 300000 })
        .expect(401);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete a property with admin token', async () => {
      const response = await request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should fail to delete with agent token (insufficient permissions)', async () => {
      // Create another property for this test
      const testProp = await Property.create({
        ownerId,
        title: 'Property to Delete',
        propertyType: 'apartment',
        price: 200000,
        address: '999 Test St',
        city: 'Valletta'
      });

      await request(app)
        .delete(`/api/properties/${testProp.id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      // Clean up
      await testProp.destroy();
    });
  });
});
