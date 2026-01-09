const { Agent, User, Property } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new agent
 * POST /api/agents
 */
const createAgent = async (req, res) => {
  try {
    const agentData = req.body;

    // Verify user exists
    const user = await User.findByPk(agentData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if user already has an agent profile
    const existingAgent = await Agent.findOne({ where: { userId: agentData.userId } });
    if (existingAgent) {
      return res.status(409).json({
        success: false,
        message: 'Agent profile already exists for this user.'
      });
    }

    // Check if license number already exists (if provided)
    if (agentData.licenseNumber) {
      const agentWithLicense = await Agent.findOne({ 
        where: { licenseNumber: agentData.licenseNumber } 
      });
      if (agentWithLicense) {
        return res.status(409).json({
          success: false,
          message: 'Agent with this license number already exists.'
        });
      }
    }

    const agent = await Agent.create(agentData);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully.',
      data: agent
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating agent.',
      error: error.message
    });
  }
};

/**
 * Get all agents with optional search
 * GET /api/agents
 */
const getAgents = async (req, res) => {
  try {
    const {
      search,
      specialization,
      isActive,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { specialization: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (specialization) {
      where.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: agents } = await Agent.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        agents,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agents.',
      error: error.message
    });
  }
};

/**
 * Get a single agent by ID
 * GET /api/agents/:id
 */
const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: Property,
          as: 'properties',
          attributes: ['id', 'title', 'propertyType', 'listingType', 'status', 'price', 'city']
        }
      ]
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent.',
      error: error.message
    });
  }
};

/**
 * Update an agent
 * PUT /api/agents/:id
 */
const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found.'
      });
    }

    // Check if license number is being updated and already exists
    if (updateData.licenseNumber && updateData.licenseNumber !== agent.licenseNumber) {
      const agentWithLicense = await Agent.findOne({ 
        where: { licenseNumber: updateData.licenseNumber } 
      });
      if (agentWithLicense) {
        return res.status(409).json({
          success: false,
          message: 'Agent with this license number already exists.'
        });
      }
    }

    await agent.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully.',
      data: agent
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating agent.',
      error: error.message
    });
  }
};

/**
 * Delete an agent
 * DELETE /api/agents/:id
 */
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found.'
      });
    }

    await agent.destroy();

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully.'
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting agent.',
      error: error.message
    });
  }
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent
};
