const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  getInquiriesByProperty,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} = require('../controllers/inquiryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createInquirySchema,
  updateInquirySchema
} = require('../validations/inquiryValidation');

/**
 * @route   POST /api/inquiries
 * @desc    Create a new inquiry
 * @access  Public
 */
router.post(
  '/',
  validate(createInquirySchema),
  createInquiry
);

/**
 * @route   GET /api/inquiries
 * @desc    Get all inquiries with optional filters
 * @access  Private (Admin, Agent)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  getInquiries
);

/**
 * @route   GET /api/inquiries/property/:propertyId
 * @desc    Get inquiries by property
 * @access  Private (Admin, Agent)
 */
router.get(
  '/property/:propertyId',
  authenticate,
  authorize('admin', 'agent'),
  getInquiriesByProperty
);

/**
 * @route   GET /api/inquiries/:id
 * @desc    Get a single inquiry by ID
 * @access  Private (Admin, Agent)
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  getInquiryById
);

/**
 * @route   PUT /api/inquiries/:id
 * @desc    Update an inquiry
 * @access  Private (Admin, Agent)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  validate(updateInquirySchema),
  updateInquiry
);

/**
 * @route   DELETE /api/inquiries/:id
 * @desc    Delete an inquiry
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteInquiry
);

module.exports = router;
