const { Owner, Property } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new owner
 * POST /api/owners
 */
const createOwner = async (req, res) => {
  try {
    const ownerData = req.body;

    // Check if owner with email already exists
    const existingOwner = await Owner.findOne({ where: { email: ownerData.email } });
    if (existingOwner) {
      return res.status(409).json({
        success: false,
        message: 'Owner with this email already exists.'
      });
    }

    const owner = await Owner.create(ownerData);

    res.status(201).json({
      success: true,
      message: 'Owner created successfully.',
      data: owner
    });
  } catch (error) {
    console.error('Create owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating owner.',
      error: error.message
    });
  }
};

/**
 * Get all owners with optional search
 * GET /api/owners
 */
const getOwners = async (req, res) => {
  try {
    const {
      search,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: owners } = await Owner.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        owners,
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
    res.status(500).json({
      success: false,
      message: 'Error fetching owners.',
      error: error.message
    });
  }
};

/**
 * Get a single owner by ID
 * GET /api/owners/:id
 */
const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await Owner.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'properties',
          attributes: ['id', 'title', 'propertyType', 'listingType', 'status', 'price', 'city']
        }
      ]
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: owner
    });
  } catch (error) {
    console.error('Get owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching owner.',
      error: error.message
    });
  }
};

/**
 * Update an owner
 * PUT /api/owners/:id
 */
const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const owner = await Owner.findByPk(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found.'
      });
    }

    // Check if email is being updated and already exists
    if (updateData.email && updateData.email !== owner.email) {
      const existingOwner = await Owner.findOne({ where: { email: updateData.email } });
      if (existingOwner) {
        return res.status(409).json({
          success: false,
          message: 'Owner with this email already exists.'
        });
      }
    }

    await owner.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Owner updated successfully.',
      data: owner
    });
  } catch (error) {
    console.error('Update owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating owner.',
      error: error.message
    });
  }
};

/**
 * Delete an owner
 * DELETE /api/owners/:id
 */
const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await Owner.findByPk(id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found.'
      });
    }

    // Check if owner has properties
    const propertyCount = await Property.count({ where: { ownerId: id } });
    if (propertyCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete owner. Owner has ${propertyCount} associated properties.`
      });
    }

    await owner.destroy();

    res.status(200).json({
      success: true,
      message: 'Owner deleted successfully.'
    });
  } catch (error) {
    console.error('Delete owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting owner.',
      error: error.message
    });
  }
};

module.exports = {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner
};
