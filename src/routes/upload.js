const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.post('/', authenticateToken, limiter, upload.array('files', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const urls = req.files.map(f => {
      const isDoc = f.mimetype === 'application/pdf';
      return `/uploads${isDoc ? '/documents' : ''}/${f.filename}`;
    });
    res.json({ success: true, data: { urls } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
