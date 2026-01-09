const { Property, Owner, Agent } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new property
 * POST /api/properties
 */
const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;

    // Verify owner exists
    const owner = await Owner.findByPk(propertyData.ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found.'
      });
    }

    // Verify agent exists if provided
    if (propertyData.agentId) {
      const agent = await Agent.findByPk(propertyData.agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found.'
        });
      }
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property.',
      error: error.message
    });
  }
};

/**
 * Get all properties with optional filters
 * GET /api/properties
 */
const getProperties = async (req, res) => {
  try {
    const {
      propertyType,
      listingType,
      status,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      featured,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};
    
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (status) where.status = status;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (featured !== undefined) where.featured = featured === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    if (bedrooms) where.bedrooms = { [Op.gte]: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { [Op.gte]: parseInt(bathrooms) };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: Owner,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'licenseNumber', 'specialization', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties.',
      error: error.message
    });
  }
};

/**
 * Get a single property by ID
 * GET /api/properties/:id
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      include: [
        {
          model: Owner,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'mobile']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'licenseNumber', 'specialization', 'phone', 'mobile', 'bio']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property.',
      error: error.message
    });
  }
};

/**
 * Update a property
 * PUT /api/properties/:id
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    // Verify owner exists if being updated
    if (updateData.ownerId) {
      const owner = await Owner.findByPk(updateData.ownerId);
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner not found.'
        });
      }
    }

    // Verify agent exists if being updated
    if (updateData.agentId) {
      const agent = await Agent.findByPk(updateData.agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found.'
        });
      }
    }

    await property.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property.',
      error: error.message
    });
  }
};

/**
 * Delete a property
 * DELETE /api/properties/:id
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    await property.destroy();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully.'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property.',
      error: error.message
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};
