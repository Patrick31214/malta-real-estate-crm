const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createPropertySchema,
  updatePropertySchema
} = require('../validations/propertyValidation');

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Admin, Agent)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  validate(createPropertySchema),
  createProperty
);

/**
 * @route   GET /api/properties
 * @desc    Get all properties with optional filters
 * @access  Public
 */
router.get('/', getProperties);

/**
 * @route   GET /api/properties/:id
 * @desc    Get a single property by ID
 * @access  Public
 */
router.get('/:id', getPropertyById);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update a property
 * @access  Private (Admin, Agent)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updatePropertySchema),
  updateProperty
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete a property
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProperty
);

module.exports = router;
