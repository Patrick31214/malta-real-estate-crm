const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { Inquiry } = require('../models');
const { getInquiries, getInquiry, createInquiry, updateInquiry, deleteInquiry } = require('../controllers/inquiryController');
const { authenticate } = require('../middleware/auth');

// Public route - no auth required (website contact forms)
router.post('/public', createInquiry);

// GET /api/inquiries/trend — last 7 days grouped by date
router.get('/trend', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rows = await Inquiry.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      group: [literal('DATE(created_at)')],
      order: [[literal('DATE(created_at)'), 'ASC']],
      raw: true,
    });

    // Build a map of date string → count
    const countMap = {};
    rows.forEach(r => {
      countMap[r.date] = parseInt(r.count, 10);
    });

    // Fill all 7 days (including zeros)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      trend.push({
        day: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        inquiries: countMap[key] || 0,
      });
    }

    return res.json({ success: true, data: { trend } });
  } catch (err) {
    console.error('Inquiry trend error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch trend data' });
  }
});

router.get('/', authenticate, getInquiries);
router.get('/:id', authenticate, getInquiry);
router.post('/', authenticate, createInquiry);
router.put('/:id', authenticate, updateInquiry);
router.delete('/:id', authenticate, deleteInquiry);

module.exports = router;
