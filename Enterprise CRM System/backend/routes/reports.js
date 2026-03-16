const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');
const reportController = require('../controllers/reportController');

// All report routes require authentication + tenant scope
router.use(auth);
router.use(tenantMiddleware);

// Reports — most are readable by anyone with reports:read
router.get('/dashboard', reportController.getDashboard);
router.get('/pipeline', reportController.getPipelineReport);
router.get('/forecast', reportController.getForecastReport);
router.get('/team', roleMiddleware('reports:read', 'team:read'), reportController.getTeamReport);
router.get('/conversion', reportController.getConversionReport);

module.exports = router;
