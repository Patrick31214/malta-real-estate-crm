const { Owner, Property } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('./activityLogController');

/**
 * Get all owners with pagination
 * GET /api/owners
 */
const getOwners = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Owner.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Log access for agent role
    if (req.user && req.user.role === 'agent') {
      await logActivity({
        agentUserId: req.user.userId,
        action: 'VIEW_OWNER_LIST',
        resourceType: 'owner',
        resourceLabel: `Viewed ${count} owners (search: "${String(search || '').slice(0, 100)}")`,
        ipAddress: req.ip
      });
    }

    res.status(200).json({
      success: true,
      data: {
        owners: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({ success: false, message: 'Error fetching owners.', error: error.message });
  }
};

/**
 * Get a single owner by ID
 * GET /api/owners/:id
 */
const getOwner = async (req, res) => {
  try {
    const owner = await Owner.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: Property, as: 'properties', where: { isActive: true }, required: false }]
    });

    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found.' });
    }

    // Log sensitive data access for agents
    if (req.user && req.user.role === 'agent') {
      await logActivity({
        agentUserId: req.user.userId,
        action: 'VIEW_OWNER_DETAILS',
        resourceType: 'owner',
        resourceId: owner.id,
        resourceLabel: `${owner.firstName} ${owner.lastName}`,
        ipAddress: req.ip
      });
    }

    res.status(200).json({ success: true, data: { owner } });
  } catch (error) {
    console.error('Get owner error:', error);
    res.status(500).json({ success: false, message: 'Error fetching owner.', error: error.message });
  }
};

/**
 * Create a new owner
 * POST /api/owners
 */
const createOwner = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Owner.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Owner with this email already exists.' });
    }

    const owner = await Owner.create(req.body);
    res.status(201).json({ success: true, message: 'Owner created successfully.', data: { owner } });
  } catch (error) {
    console.error('Create owner error:', error);
    res.status(500).json({ success: false, message: 'Error creating owner.', error: error.message });
  }
};

/**
 * Update an owner
 * PUT /api/owners/:id
 */
const updateOwner = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found.' });
    }

    await owner.update(req.body);
    res.status(200).json({ success: true, message: 'Owner updated successfully.', data: { owner } });
  } catch (error) {
    console.error('Update owner error:', error);
    res.status(500).json({ success: false, message: 'Error updating owner.', error: error.message });
  }
};

/**
 * Delete (soft-delete) an owner
 * DELETE /api/owners/:id
 */
const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found.' });
    }

    await owner.update({ isActive: false });
    res.status(200).json({ success: true, message: 'Owner deleted successfully.' });
  } catch (error) {
    console.error('Delete owner error:', error);
    res.status(500).json({ success: false, message: 'Error deleting owner.', error: error.message });
  }
};

module.exports = { getOwners, getOwner, createOwner, updateOwner, deleteOwner };
