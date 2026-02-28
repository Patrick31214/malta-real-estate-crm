const express = require('express');
const router = express.Router();
const { getAgents, getAgent, createAgent, updateAgent, deleteAgent } = require('../controllers/agentController');
const { authenticate, authorize } = require('../middleware/auth');
const { User } = require('../models');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.get('/', limiter, authenticate, getAgents);
router.get('/:id', limiter, authenticate, getAgent);
router.post('/', limiter, authenticate, createAgent);
router.put('/:id', limiter, authenticate, updateAgent);
router.delete('/:id', limiter, authenticate, deleteAgent);

/**
 * Block or unblock an agent's user account (admin/manager only)
 * PUT /api/agents/:id/block
 * body: { blocked: true/false }
 */
router.put('/:id/block', limiter, authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { blocked } = req.body;
    if (typeof blocked !== 'boolean') {
      return res.status(400).json({ success: false, message: "'blocked' must be a boolean." });
    }
    const { Agent } = require('../models');
    const agent = await Agent.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!agent || !agent.user) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }
    await agent.user.update({ isActive: !blocked });
    res.status(200).json({
      success: true,
      message: blocked ? 'Agent account blocked.' : 'Agent account unblocked.',
      data: { userId: agent.user.id, isActive: !blocked }
    });
  } catch (error) {
    console.error('Block agent error:', error);
    res.status(500).json({ success: false, message: 'Error updating agent status.', error: error.message });
  }
});

module.exports = router;
