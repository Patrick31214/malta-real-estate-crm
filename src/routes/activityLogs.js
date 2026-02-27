const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

// Only admin and manager can view activity logs
router.get('/', limiter, authenticate, authorize('admin', 'manager'), getActivityLogs);

module.exports = router;
