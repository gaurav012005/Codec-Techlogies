const router = require('express').Router();
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');
const ctrl = require('../controllers/workflowController');

router.use(auth, tenant);

router.get('/analytics', ctrl.getAnalytics);
router.get('/', ctrl.getWorkflows);
router.get('/:id', ctrl.getWorkflow);
router.post('/', roleMiddleware('pipelines:write'), ctrl.createWorkflow);
router.put('/:id', roleMiddleware('pipelines:write'), ctrl.updateWorkflow);
router.delete('/:id', roleMiddleware('pipelines:write'), ctrl.deleteWorkflow);
router.put('/:id/toggle', roleMiddleware('pipelines:write'), ctrl.toggleWorkflow);
router.post('/:id/test', roleMiddleware('pipelines:write'), ctrl.testWorkflow);
router.get('/:id/executions', ctrl.getExecutions);

module.exports = router;
