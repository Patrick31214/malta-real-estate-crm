const { Inquiry, Property, Agent } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new inquiry
 * POST /api/inquiries
 */
const createInquiry = async (req, res) => {
  try {
    const inquiryData = req.body;

    // Verify property exists
    const property = await Property.findByPk(inquiryData.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    // Verify agent exists if provided
    if (inquiryData.agentId) {
      const agent = await Agent.findByPk(inquiryData.agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found.'
        });
      }
    }

    const inquiry = await Inquiry.create(inquiryData);

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully.',
      data: inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inquiry.',
      error: error.message
    });
  }
};

/**
 * Get all inquiries with optional filters
 * GET /api/inquiries
 */
const getInquiries = async (req, res) => {
  try {
    const {
      propertyId,
      agentId,
      status,
      inquiryType,
      priority,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};
    
    if (propertyId) where.propertyId = propertyId;
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;
    if (inquiryType) where.inquiryType = inquiryType;
    if (priority) where.priority = priority;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: inquiries } = await Inquiry.findAndCountAll({
      where,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'propertyType', 'city', 'price']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'licenseNumber', 'specialization']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        inquiries,
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
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries.',
      error: error.message
    });
  }
};

/**
 * Get inquiries by property
 * GET /api/inquiries/property/:propertyId
 */
const getInquiriesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: inquiries } = await Inquiry.findAndCountAll({
      where: { propertyId },
      include: [
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'licenseNumber', 'specialization']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        inquiries,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries by property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries.',
      error: error.message
    });
  }
};

/**
 * Get a single inquiry by ID
 * GET /api/inquiries/:id
 */
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'propertyType', 'city', 'price', 'address']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'licenseNumber', 'specialization', 'phone', 'mobile']
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry.',
      error: error.message
    });
  }
};

/**
 * Update an inquiry
 * PUT /api/inquiries/:id
 */
const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
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

    await inquiry.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully.',
      data: inquiry
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inquiry.',
      error: error.message
    });
  }
};

/**
 * Delete an inquiry
 * DELETE /api/inquiries/:id
 */
const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    await inquiry.destroy();

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inquiry.',
      error: error.message
    });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiriesByProperty,
  getInquiryById,
  updateInquiry,
  deleteInquiry
};
