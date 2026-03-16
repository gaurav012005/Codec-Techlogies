// Attempt Routes — /api/attempts (placeholder)
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => { res.status(501).json({ message: 'Exam attempts — coming in Feature 6' }); });
module.exports = router;
