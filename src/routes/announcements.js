const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const { Announcement } = require('../models');
    const announcements = await Announcement.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { Announcement } = require('../models');
    const announcement = await Announcement.create({ ...req.body, authorId: req.user.id });
    res.status(201).json({ success: true, data: { announcement } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { Announcement } = require('../models');
    const a = await Announcement.findByPk(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Not found' });
    await a.update({ isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
