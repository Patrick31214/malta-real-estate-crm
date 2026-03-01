const express = require('express');
const router = express.Router();
const { AutomatedContactLog } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { Op } = require('sequelize');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

// GET /api/automated-contacts/summary
router.get('/summary', limiter, authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAI, totalAgent, thisMonthAI, thisMonthAgent] = await Promise.all([
      AutomatedContactLog.count({ where: { automationTrigger: { [Op.ne]: null } } }),
      AutomatedContactLog.count({ where: { agentId: { [Op.ne]: null }, automationTrigger: null } }),
      AutomatedContactLog.count({
        where: { automationTrigger: { [Op.ne]: null }, createdAt: { [Op.gte]: startOfMonth } }
      }),
      AutomatedContactLog.count({
        where: { agentId: { [Op.ne]: null }, automationTrigger: null, createdAt: { [Op.gte]: startOfMonth } }
      }),
    ]);

    res.json({ success: true, data: { totalAI, totalAgent, thisMonthAI, thisMonthAgent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
