const express = require('express');
const router = express.Router();
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getProperties);
router.get('/:id', authenticate, getProperty);
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

module.exports = router;
