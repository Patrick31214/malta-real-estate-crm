const express = require('express');
const router = express.Router();
const { getProperties, getProperty, createProperty, updateProperty, approveProperty, deleteProperty } = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getProperties);
router.get('/:id', authenticate, getProperty);
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.put('/:id/approve', authenticate, authorize('admin', 'manager'), approveProperty);
router.delete('/:id', authenticate, deleteProperty);

module.exports = router;
