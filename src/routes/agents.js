const express = require('express');
const router = express.Router();
const { getAgents, getAgent, createAgent, updateAgent, deleteAgent } = require('../controllers/agentController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.get('/', limiter, authenticate, getAgents);
router.get('/:id', limiter, authenticate, getAgent);
router.post('/', limiter, authenticate, createAgent);
router.put('/:id', limiter, authenticate, updateAgent);
router.delete('/:id', limiter, authenticate, deleteAgent);

module.exports = router;
