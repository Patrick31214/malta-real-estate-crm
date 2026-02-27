const express = require('express');
const router = express.Router();
const { getProperties, getProperty, createProperty, updateProperty, approveProperty, deleteProperty } = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.get('/', limiter, authenticate, getProperties);
router.get('/:id', limiter, authenticate, getProperty);
router.post('/', limiter, authenticate, createProperty);
router.put('/:id', limiter, authenticate, updateProperty);
router.put('/:id/approve', limiter, authenticate, authorize('admin', 'manager'), approveProperty);
router.delete('/:id', limiter, authenticate, deleteProperty);

module.exports = router;
