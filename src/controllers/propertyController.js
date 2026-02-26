const { Property, Owner, Agent } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all properties with pagination and filtering
 * GET /api/properties
 */
const getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };

    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Property.findAndCountAll({
      where,
      include: [
        { model: Owner, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Agent, as: 'agent', attributes: ['id', 'phone', 'mobile'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        properties: rows,
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
    res.status(500).json({ success: false, message: 'Error fetching properties.', error: error.message });
  }
};

/**
 * Get a single property by ID
 * GET /api/properties/:id
 */
const getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        { model: Owner, as: 'owner' },
        { model: Agent, as: 'agent' }
      ]
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Increment view count
    await property.increment('viewCount');

    res.status(200).json({ success: true, data: { property } });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ success: false, message: 'Error fetching property.', error: error.message });
  }
};

/**
 * Create a new property
 * POST /api/properties
 */
const createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, message: 'Property created successfully.', data: { property } });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ success: false, message: 'Error creating property.', error: error.message });
  }
};

/**
 * Update a property
 * PUT /api/properties/:id
 */
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    await property.update(req.body);
    res.status(200).json({ success: true, message: 'Property updated successfully.', data: { property } });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ success: false, message: 'Error updating property.', error: error.message });
  }
};

/**
 * Delete (soft-delete) a property
 * DELETE /api/properties/:id
 */
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    await property.update({ isActive: false });
    res.status(200).json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ success: false, message: 'Error deleting property.', error: error.message });
  }
};

module.exports = { getProperties, getProperty, createProperty, updateProperty, deleteProperty };
