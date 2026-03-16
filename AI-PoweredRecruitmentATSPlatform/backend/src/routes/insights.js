const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getInsightsOverview } = require('../controllers/insightsController');

router.get('/overview', auth, getInsightsOverview);

module.exports = router;
