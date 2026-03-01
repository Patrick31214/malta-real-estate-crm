const { Agent, User, Property, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * Get all agents with pagination
 * GET /api/agents
 */
const getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { licenseNumber: { [Op.iLike]: `%${search}%` } },
        { specialization: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Agent.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'isBlocked', 'blockedReason'],
          ...(search ? {
            where: {
              [Op.or]: [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
              ]
            },
            required: false
          } : {})
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(*) FROM "properties" WHERE "properties"."agentId" = "Agent"."id" AND "properties"."isActive" = true)`),
            'propertiesCount'
          ],
          [
            sequelize.literal(`(SELECT COUNT(*) FROM "inquiries" WHERE "inquiries"."agentId" = "Agent"."id")`),
            'inquiriesCount'
          ]
        ]
      },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        agents: rows,
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
    res.status(500).json({ success: false, message: 'Error fetching agents.', error: error.message });
  }
};

/**
 * Get a single agent by ID
 * GET /api/agents/:id
 */
const getAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Property, as: 'properties', where: { isActive: true }, required: false }
      ]
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    res.status(200).json({ success: true, data: { agent } });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ success: false, message: 'Error fetching agent.', error: error.message });
  }
};

/**
 * Create a new agent (also creates a linked User account with role 'agent')
 * POST /api/agents
 */
const createAgent = async (req, res) => {
  try {
    const {
      firstName, lastName, email,
      licenseNumber, specialization, commissionRate,
      phone, mobile, officeAddress, bio,
      languages, yearsExperience,
      role, branchId, managerName, subRole
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name and email are required.' });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Generate a temporary password using crypto for sufficient entropy
    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '') + 'A1!';

    // Create the User record
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: tempPassword,
      role: ['agent', 'manager', 'employee'].includes(role) ? role : 'agent'
    });

    // Create the Agent profile
    const agent = await Agent.create({
      userId: user.id,
      licenseNumber: licenseNumber || null,
      specialization: specialization || null,
      commissionRate: commissionRate || 0,
      phone: phone || null,
      mobile: mobile || null,
      officeAddress: officeAddress || null,
      bio: bio || null,
      languages: languages || ['English'],
      yearsExperience: yearsExperience || 0,
      isActive: true,
      branchId: branchId || null,
      managerName: managerName || null,
      subRole: subRole || null
    });

    const result = await Agent.findOne({
      where: { id: agent.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully.',
      data: { agent: result, tempPassword }
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ success: false, message: 'Error creating agent.', error: error.message });
  }
};

/**
 * Update an agent
 * PUT /api/agents/:id
 */
const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: User, as: 'user' }]
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    const {
      firstName, lastName, email,
      licenseNumber, specialization, commissionRate,
      phone, mobile, officeAddress, bio,
      languages, yearsExperience, isActive,
      role, branchId, managerName, subRole
    } = req.body;

    // Update linked user's name/email/role if provided
    if (firstName || lastName || email || role) {
      const userUpdates = {};
      if (firstName) userUpdates.firstName = firstName;
      if (lastName) userUpdates.lastName = lastName;
      if (email && email !== agent.user.email) {
        const existing = await User.findOne({ where: { email, id: { [Op.ne]: agent.user.id } } });
        if (existing) {
          return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
        }
        userUpdates.email = email;
      }
      if (role && ['agent', 'manager', 'employee'].includes(role)) userUpdates.role = role;
      if (Object.keys(userUpdates).length > 0) {
        await agent.user.update(userUpdates);
      }
    }

    // Update agent fields
    const agentUpdates = {};
    if (licenseNumber !== undefined) agentUpdates.licenseNumber = licenseNumber;
    if (specialization !== undefined) agentUpdates.specialization = specialization;
    if (commissionRate !== undefined) agentUpdates.commissionRate = commissionRate;
    if (phone !== undefined) agentUpdates.phone = phone;
    if (mobile !== undefined) agentUpdates.mobile = mobile;
    if (officeAddress !== undefined) agentUpdates.officeAddress = officeAddress;
    if (bio !== undefined) agentUpdates.bio = bio;
    if (languages !== undefined) agentUpdates.languages = languages;
    if (yearsExperience !== undefined) agentUpdates.yearsExperience = yearsExperience;
    if (isActive !== undefined) agentUpdates.isActive = isActive;
    if (branchId !== undefined) agentUpdates.branchId = branchId || null;
    if (managerName !== undefined) agentUpdates.managerName = managerName || null;
    if (subRole !== undefined) agentUpdates.subRole = subRole || null;

    await agent.update(agentUpdates);

    const updated = await Agent.findOne({
      where: { id: agent.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
    });

    res.status(200).json({ success: true, message: 'Agent updated successfully.', data: { agent: updated } });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ success: false, message: 'Error updating agent.', error: error.message });
  }
};

/**
 * Delete (soft-delete) an agent
 * DELETE /api/agents/:id
 */
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    await agent.update({ isActive: false });
    res.status(200).json({ success: true, message: 'Agent removed successfully.' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ success: false, message: 'Error removing agent.', error: error.message });
  }
};

module.exports = { getAgents, getAgent, createAgent, updateAgent, deleteAgent };
