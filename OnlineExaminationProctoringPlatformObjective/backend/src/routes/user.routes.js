// Auth Routes — /api/users (placeholder)
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => { res.status(501).json({ message: 'User management — coming in Feature 3' }); });
module.exports = router;
