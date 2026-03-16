const express = require('express');
const router = express.Router();
const lc = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/stats', roleMiddleware('leads:read'), lc.getLeadStats);
router.get('/', roleMiddleware('leads:read'), lc.getLeads);
router.get('/:id', roleMiddleware('leads:read'), lc.getLead);
router.post('/', roleMiddleware('leads:write'), lc.createLead);
router.put('/:id', roleMiddleware('leads:write'), lc.updateLead);
router.delete('/:id', roleMiddleware('leads:delete'), lc.deleteLead);

module.exports = router;
