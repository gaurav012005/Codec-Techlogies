const express = require('express');
const router = express.Router();
const dc = require('../controllers/dealController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/forecast', roleMiddleware('deals:read'), dc.getForecast);
router.get('/board/:pipelineId', roleMiddleware('deals:read'), dc.getDealBoard);
router.get('/', roleMiddleware('deals:read'), dc.getDeals);
router.get('/:id/prediction', roleMiddleware('deals:read'), dc.getDealPrediction);
router.get('/:id', roleMiddleware('deals:read'), dc.getDeal);
router.post('/', roleMiddleware('deals:write'), dc.createDeal);
router.put('/:id/stage', roleMiddleware('deals:write'), dc.moveDealStage);
router.put('/:id', roleMiddleware('deals:write'), dc.updateDeal);
router.delete('/:id', roleMiddleware('deals:delete'), dc.deleteDeal);

module.exports = router;
