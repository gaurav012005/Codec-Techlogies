const express = require('express');
const router = express.Router();
const tc = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/stats', roleMiddleware('tasks:read'), tc.getTaskStats);
router.get('/', roleMiddleware('tasks:read'), tc.getTasks);
router.get('/:id', roleMiddleware('tasks:read'), tc.getTask);
router.post('/', roleMiddleware('tasks:write'), tc.createTask);
router.put('/:id/complete', roleMiddleware('tasks:write'), tc.completeTask);
router.put('/:id', roleMiddleware('tasks:write'), tc.updateTask);
router.delete('/:id', roleMiddleware('tasks:write'), tc.deleteTask);

module.exports = router;
