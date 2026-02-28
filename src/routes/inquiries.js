const express = require('express');
const router = express.Router();
const { getInquiries, getInquiry, createInquiry, updateInquiry, deleteInquiry } = require('../controllers/inquiryController');
const { authenticate } = require('../middleware/auth');

// Public route - no auth required (website contact forms)
router.post('/public', createInquiry);

router.get('/', authenticate, getInquiries);
router.get('/:id', authenticate, getInquiry);
router.post('/', authenticate, createInquiry);
router.put('/:id', authenticate, updateInquiry);
router.delete('/:id', authenticate, deleteInquiry);

module.exports = router;
