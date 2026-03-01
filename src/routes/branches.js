const express = require('express');
const router = express.Router();
const { getBranches, getBranch, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { authenticate, authorize } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.get('/', limiter, authenticate, getBranches);
router.get('/:id', limiter, authenticate, getBranch);
router.post('/', limiter, authenticate, authorize('admin'), createBranch);
router.put('/:id', limiter, authenticate, authorize('admin'), updateBranch);
router.delete('/:id', limiter, authenticate, authorize('admin'), deleteBranch);

module.exports = router;
