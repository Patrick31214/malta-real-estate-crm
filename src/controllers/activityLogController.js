const { AgentActivityLog, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Log an agent action (called from other controllers or middleware)
 */
const logActivity = async ({ agentUserId, action, resourceType, resourceId, resourceLabel, ipAddress }) => {
  try {
    await AgentActivityLog.create({
      agentUserId,
      action,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      resourceLabel: resourceLabel || null,
      ipAddress: ipAddress || null
    });
  } catch (err) {
    // Non-fatal: log failure should not crash the main request
    console.error('Failed to log agent activity:', err.message);
  }
};

/**
 * Get activity logs (admin/manager only)
 * GET /api/activity-logs
 */
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, agentUserId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (agentUserId) where.agentUserId = agentUserId;

    const { count, rows } = await AgentActivityLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching activity logs.', error: error.message });
  }
};

module.exports = { logActivity, getActivityLogs };
