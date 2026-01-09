const express = require('express');
const router = express.Router();
const {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner
} = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createOwnerSchema,
  updateOwnerSchema
} = require('../validations/ownerValidation');

/**
 * @route   POST /api/owners
 * @desc    Create a new owner
 * @access  Private (Admin, Agent)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  validate(createOwnerSchema),
  createOwner
);

/**
 * @route   GET /api/owners
 * @desc    Get all owners
 * @access  Private (Admin, Agent)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  getOwners
);

/**
 * @route   GET /api/owners/:id
 * @desc    Get a single owner by ID
 * @access  Private (Admin, Agent)
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  getOwnerById
);

/**
 * @route   PUT /api/owners/:id
 * @desc    Update an owner
 * @access  Private (Admin, Agent)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updateOwnerSchema),
  updateOwner
);

/**
 * @route   DELETE /api/owners/:id
 * @desc    Delete an owner
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteOwner
);

module.exports = router;
