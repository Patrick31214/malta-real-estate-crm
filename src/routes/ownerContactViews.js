const express = require('express');
const router = express.Router();
const { OwnerContactView, Agent, Owner, Property, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { Op } = require('sequelize');

const DAILY_VIEW_LIMIT = parseInt(process.env.OWNER_VIEW_LIMIT || '50', 10);
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

// GET /api/owner-contact-views/summary
router.get('/summary', limiter, authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, thisMonth] = await Promise.all([
      OwnerContactView.count(),
      OwnerContactView.count({ where: { viewedAt: { [Op.gte]: startOfMonth } } }),
    ]);
    res.json({ success: true, data: { total, thisMonth } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Log a view of owner contact details
router.post('/', limiter, authenticateToken, async (req, res) => {
  try {
    const { ownerId, propertyId } = req.body;
    
    // Find agent for current user
    const agent = await Agent.findOne({ where: { userId: req.user.id } });
    if (!agent) return res.status(403).json({ success: false, message: 'Agent profile required.' });
    
    // Check daily rate limit (50 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCount = await OwnerContactView.count({
      where: {
        agentId: agent.id,
        viewedAt: { [Op.gte]: today }
      }
    });
    
    if (dailyCount >= DAILY_VIEW_LIMIT) {
      // Block the agent
      await User.update(
        {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: 'Security: Exceeded daily owner contact view limit (50)'
        },
        { where: { id: req.user.id } }
      );
      return res.status(429).json({ success: false, message: 'Daily limit exceeded. Account blocked.' });
    }
    
    const view = await OwnerContactView.create({
      agentId: agent.id,
      ownerId,
      propertyId: propertyId || null,
      viewedAt: new Date()
    });
    
    res.json({ success: true, data: { view } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
