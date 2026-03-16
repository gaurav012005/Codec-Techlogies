const express = require('express');
const router = express.Router();
const pc = require('../controllers/pipelineController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/', roleMiddleware('pipelines:read'), pc.getPipelines);
router.get('/:id', roleMiddleware('pipelines:read'), pc.getPipeline);
router.post('/', roleMiddleware('pipelines:write'), pc.createPipeline);
router.put('/:id', roleMiddleware('pipelines:write'), pc.updatePipeline);
router.delete('/:id', roleMiddleware('pipelines:write'), pc.deletePipeline);

module.exports = router;
