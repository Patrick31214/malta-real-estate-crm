const express = require('express');
const router = express.Router();
const { Property, Owner, Agent, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Public property listings (no authentication required)
 * GET /api/listings
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      propertyType,
      listingType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true, status: 'available' };

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
        { city: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Property.findAndCountAll({
      where,
      // Only expose non-sensitive fields to the public
      attributes: [
        'id', 'title', 'description', 'propertyType', 'listingType', 'status',
        'price', 'currency', 'bedrooms', 'bathrooms', 'squareMeters',
        'address', 'city', 'country', 'latitude', 'longitude',
        'features', 'images', 'viewCount', 'createdAt'
      ],
      include: [
        {
          model: Agent,
          as: 'agent',
          required: false,
          attributes: ['id', 'phone', 'mobile', 'specialization'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        }
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
    console.error('Get listings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching listings.', error: error.message });
  }
});

/**
 * Get a single public listing
 * GET /api/listings/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findOne({
      where: { id: req.params.id, isActive: true, status: 'available' },
      attributes: [
        'id', 'title', 'description', 'propertyType', 'listingType', 'status',
        'price', 'currency', 'bedrooms', 'bathrooms', 'squareMeters',
        'address', 'city', 'country', 'latitude', 'longitude',
        'features', 'images', 'viewCount', 'createdAt'
      ],
      include: [
        {
          model: Agent,
          as: 'agent',
          required: false,
          attributes: ['id', 'phone', 'mobile', 'specialization'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    await property.increment('viewCount');
    res.status(200).json({ success: true, data: { property } });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ success: false, message: 'Error fetching listing.', error: error.message });
  }
});

module.exports = router;
