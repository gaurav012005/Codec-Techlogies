// Question Routes — /api/questions (placeholder)
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => { res.status(501).json({ message: 'Question bank — coming in Feature 4' }); });
module.exports = router;
