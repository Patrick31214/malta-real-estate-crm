const express = require('express');
const router = express.Router();
const { Service } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { Op } = require('sequelize');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

// GET /api/public/services — no auth
router.get('/public', limiter, async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true, available: true };
    if (category) where.category = category;
    const serviceList = await Service.findAll({ where, order: [['featured', 'DESC'], ['createdAt', 'DESC']] });
    res.json({ success: true, data: { services: serviceList } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services
router.get('/', limiter, authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;
    const serviceList = await Service.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: { services: serviceList } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', limiter, authenticateToken, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, data: { service } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/services
router.post('/', limiter, authenticateToken, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: { service } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/services/:id
router.put('/:id', limiter, authenticateToken, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    await service.update(req.body);
    res.json({ success: true, data: { service } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', limiter, authenticateToken, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    await service.update({ isActive: false });
    res.json({ success: true, message: 'Service deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
