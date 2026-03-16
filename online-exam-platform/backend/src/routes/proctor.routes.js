// Proctor Routes — /api/proctor (placeholder)
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => { res.status(501).json({ message: 'Proctoring — coming in Feature 8' }); });
module.exports = router;
