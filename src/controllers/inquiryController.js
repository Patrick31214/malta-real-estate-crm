const { Inquiry, Property, Agent } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all inquiries with pagination and filtering
 * GET /api/inquiries
 */
const getInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      propertyId,
      search,
      type,
      source,
      dateFrom,
      dateTo
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (propertyId) where.propertyId = propertyId;
    const VALID_INQUIRY_TYPES = Inquiry.rawAttributes.inquiryType.values;
    if (type) {
      if (!VALID_INQUIRY_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `Invalid inquiry type: "${type}".` });
      }
      where.inquiryType = type;
    }
    if (source) where.source = source;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }
    if (search) {
      where[Op.or] = [
        { clientName: { [Op.iLike]: `%${search}%` } },
        { clientEmail: { [Op.iLike]: `%${search}%` } },
        { clientPhone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Inquiry.findAndCountAll({
      where,
      include: [
        { model: Property, as: 'property', attributes: ['id', 'title', 'city', 'price', 'status'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        inquiries: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ success: false, message: 'Error fetching inquiries.', error: error.message });
  }
};

/**
 * Get a single inquiry by ID
 * GET /api/inquiries/:id
 */
const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'property', attributes: ['id', 'title', 'city', 'price', 'status'] }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    res.status(200).json({ success: true, data: { inquiry } });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error fetching inquiry.', error: error.message });
  }
};

/**
 * Create a new inquiry
 * POST /api/inquiries
 */
const createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    const full = await Inquiry.findByPk(inquiry.id, {
      include: [{ model: Property, as: 'property', attributes: ['id', 'title', 'city', 'price', 'status'] }]
    });
    res.status(201).json({ success: true, message: 'Inquiry created successfully.', data: { inquiry: full } });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error creating inquiry.', error: error.message });
  }
};

/**
 * Update an inquiry
 * PUT /api/inquiries/:id
 */
const updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    await inquiry.update(req.body);
    res.status(200).json({ success: true, message: 'Inquiry updated successfully.', data: { inquiry } });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error updating inquiry.', error: error.message });
  }
};

/**
 * Delete an inquiry
 * DELETE /api/inquiries/:id
 */
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    await inquiry.destroy();
    res.status(200).json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ success: false, message: 'Error deleting inquiry.', error: error.message });
  }
};

module.exports = { getInquiries, getInquiry, createInquiry, updateInquiry, deleteInquiry };
