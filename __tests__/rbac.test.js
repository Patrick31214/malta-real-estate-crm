const request = require('supertest');
const express = require('express');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const { authenticate, authorize, checkPermission, getPermissionsForRole } = require('../src/middleware/auth');
const { generateAccessToken } = require('../src/utils/jwt');

// Create test app
const app = express();
app.use(express.json());

// Test routes with different authorization levels
app.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

app.get('/admin-agent', authenticate, authorize('admin', 'agent'), (req, res) => {
  res.json({ success: true, message: 'Admin or agent access granted' });
});

app.get('/permission-check', authenticate, checkPermission('properties:write'), (req, res) => {
  res.json({ success: true, message: 'Permission granted' });
});

app.get('/multi-permission', authenticate, checkPermission('users:read', 'users:write'), (req, res) => {
  res.json({ success: true, message: 'Multiple permissions granted' });
});

describe('RBAC Middleware', () => {
  let adminUser, agentUser, ownerUser, systemUser;
  let adminToken, agentToken, ownerToken, systemToken;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table
    await User.destroy({ where: {}, truncate: true });

    // Create test users with different roles
    adminUser = await User.create({
      email: 'admin@example.com',
      password: 'AdminPass123',
      role: 'admin',
      isActive: true
    });

    agentUser = await User.create({
      email: 'agent@example.com',
      password: 'AgentPass123',
      role: 'agent',
      isActive: true
    });

    ownerUser = await User.create({
      email: 'owner@example.com',
      password: 'OwnerPass123',
      role: 'owner',
      isActive: true
    });

    systemUser = await User.create({
      email: 'system@example.com',
      password: 'SystemPass123',
      role: 'system',
      isActive: true
    });

    // Generate tokens
    adminToken = generateAccessToken(adminUser.id, adminUser.email, adminUser.role);
    agentToken = generateAccessToken(agentUser.id, agentUser.email, agentUser.role);
    ownerToken = generateAccessToken(ownerUser.id, ownerUser.email, ownerUser.role);
    systemToken = generateAccessToken(systemUser.id, systemUser.email, systemUser.role);
  });

  describe('Role-Based Authorization', () => {
    it('should allow admin to access admin-only route', async () => {
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny agent access to admin-only route', async () => {
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny owner access to admin-only route', async () => {
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to access admin-agent route', async () => {
      const res = await request(app)
        .get('/admin-agent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow agent to access admin-agent route', async () => {
      const res = await request(app)
        .get('/admin-agent')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny owner access to admin-agent route', async () => {
      const res = await request(app)
        .get('/admin-agent')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Permission-Based Authorization', () => {
    it('should allow admin with properties:write permission', async () => {
      const res = await request(app)
        .get('/permission-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow agent with properties:write permission', async () => {
      const res = await request(app)
        .get('/permission-check')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny owner without properties:write permission', async () => {
      const res = await request(app)
        .get('/permission-check')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin with multiple permissions', async () => {
      const res = await request(app)
        .get('/multi-permission')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny agent without all required permissions', async () => {
      const res = await request(app)
        .get('/multi-permission')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Middleware', () => {
    it('should deny access without token', async () => {
      const res = await request(app)
        .get('/admin-only');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should deny access with invalid token', async () => {
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should deny access with malformed authorization header', async () => {
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', 'InvalidFormat token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Permission Mapping', () => {
    it('should return correct permissions for admin role', () => {
      const permissions = getPermissionsForRole('admin');
      expect(permissions).toContain('users:read');
      expect(permissions).toContain('users:write');
      expect(permissions).toContain('users:delete');
      expect(permissions).toContain('properties:read');
      expect(permissions).toContain('properties:write');
      expect(permissions).toContain('properties:delete');
      expect(permissions).toContain('system:configure');
    });

    it('should return correct permissions for agent role', () => {
      const permissions = getPermissionsForRole('agent');
      expect(permissions).toContain('properties:read');
      expect(permissions).toContain('properties:write');
      expect(permissions).toContain('clients:read');
      expect(permissions).toContain('clients:write');
      expect(permissions).not.toContain('users:delete');
    });

    it('should return correct permissions for owner role', () => {
      const permissions = getPermissionsForRole('owner');
      expect(permissions).toContain('properties:read');
      expect(permissions).toContain('profile:read');
      expect(permissions).toContain('profile:write');
      expect(permissions).not.toContain('properties:write');
    });

    it('should return correct permissions for system role', () => {
      const permissions = getPermissionsForRole('system');
      expect(permissions).toContain('system:read');
      expect(permissions).toContain('system:write');
      expect(permissions).toContain('system:execute');
    });

    it('should return empty array for unknown role', () => {
      const permissions = getPermissionsForRole('unknown');
      expect(permissions).toEqual([]);
    });
  });
});
