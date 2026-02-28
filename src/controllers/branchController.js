const { Branch, User, Agent } = require('../models');

/**
 * Get all branches with manager info and agent count
 * GET /api/branches
 */
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Agent,
          as: 'agents',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = branches.map(b => {
      const plain = b.toJSON();
      plain.agentCount = plain.agents ? plain.agents.length : 0;
      delete plain.agents;
      return plain;
    });

    res.status(200).json({ success: true, data: { branches: result } });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ success: false, message: 'Error fetching branches.', error: error.message });
  }
};

/**
 * Get a single branch with its agents
 * GET /api/branches/:id
 */
const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Agent,
          as: 'agents',
          required: false,
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ]
    });

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    res.status(200).json({ success: true, data: { branch } });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching branch.', error: error.message });
  }
};

/**
 * Create a new branch (admin only)
 * POST /api/branches
 */
const createBranch = async (req, res) => {
  try {
    const { name, city, country, address, phone, email, managerId, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Branch name is required.' });
    }

    const branch = await Branch.create({
      name,
      city: city || null,
      country: country || 'Malta',
      address: address || null,
      phone: phone || null,
      email: email || null,
      managerId: managerId || null,
      status: status || 'active'
    });

    const result = await Branch.findByPk(branch.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'], required: false }
      ]
    });

    res.status(201).json({ success: true, message: 'Branch created successfully.', data: { branch: result } });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ success: false, message: 'Error creating branch.', error: error.message });
  }
};

/**
 * Update a branch (admin only)
 * PUT /api/branches/:id
 */
const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const { name, city, country, address, phone, email, managerId, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (country !== undefined) updates.country = country;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (managerId !== undefined) updates.managerId = managerId;
    if (status !== undefined) updates.status = status;

    await branch.update(updates);

    const result = await Branch.findByPk(branch.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'], required: false }
      ]
    });

    res.status(200).json({ success: true, message: 'Branch updated successfully.', data: { branch: result } });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ success: false, message: 'Error updating branch.', error: error.message });
  }
};

/**
 * Delete a branch (admin only)
 * DELETE /api/branches/:id
 */
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    await branch.destroy();
    res.status(200).json({ success: true, message: 'Branch deleted successfully.' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ success: false, message: 'Error deleting branch.', error: error.message });
  }
};

module.exports = { getBranches, getBranch, createBranch, updateBranch, deleteBranch };
