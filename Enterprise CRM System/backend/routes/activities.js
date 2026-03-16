const express = require('express');
const router = express.Router();
const ac = require('../controllers/activityController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/', roleMiddleware('leads:read'), ac.getActivities);
router.get('/:entityType/:entityId', roleMiddleware('leads:read'), ac.getEntityTimeline);
router.post('/', roleMiddleware('leads:write'), ac.createActivity);

module.exports = router;
