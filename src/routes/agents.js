const express = require('express');
const router = express.Router();
const {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createAgentSchema,
  updateAgentSchema
} = require('../validations/agentValidation');

/**
 * @route   POST /api/agents
 * @desc    Create a new agent
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createAgentSchema),
  createAgent
);

/**
 * @route   GET /api/agents
 * @desc    Get all agents
 * @access  Public
 */
router.get('/', getAgents);

/**
 * @route   GET /api/agents/:id
 * @desc    Get a single agent by ID
 * @access  Public
 */
router.get('/:id', getAgentById);

/**
 * @route   PUT /api/agents/:id
 * @desc    Update an agent
 * @access  Private (Admin, Agent - own profile)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updateAgentSchema),
  updateAgent
);

/**
 * @route   DELETE /api/agents/:id
 * @desc    Delete an agent
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteAgent
);

module.exports = router;
