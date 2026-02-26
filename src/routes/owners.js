const express = require('express');
const router = express.Router();
const { getOwners, getOwner, createOwner, updateOwner, deleteOwner } = require('../controllers/ownerController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOwners);
router.get('/:id', authenticate, getOwner);
router.post('/', authenticate, createOwner);
router.put('/:id', authenticate, updateOwner);
router.delete('/:id', authenticate, deleteOwner);

module.exports = router;
