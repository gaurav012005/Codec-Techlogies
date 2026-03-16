const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');
const adminController = require('../controllers/adminController');

router.use(auth);
router.use(tenantMiddleware);

// User management — super_admin and sales_manager
router.get('/users', adminController.getUsers);
router.put('/users/:id', roleMiddleware('team:read'), adminController.updateUser);
router.put('/users/:id/role', roleMiddleware('team:read'), adminController.updateUserRole);
router.delete('/users/:id', roleMiddleware('team:read'), adminController.deactivateUser);

// Custom fields
router.get('/custom-fields', adminController.getCustomFields);
router.post('/custom-fields', roleMiddleware('team:read'), adminController.createCustomField);
router.put('/custom-fields/:id', roleMiddleware('team:read'), adminController.updateCustomField);
router.delete('/custom-fields/:id', roleMiddleware('team:read'), adminController.deleteCustomField);

// Sales targets
router.get('/targets', adminController.getTargets);
router.put('/targets', roleMiddleware('team:read'), adminController.setTargets);

// Audit logs
router.get('/audit-logs', roleMiddleware('team:read'), adminController.getAuditLogs);

// Pipeline configuration
router.put('/pipelines/:id/stages', roleMiddleware('pipelines:write'), adminController.updatePipelineStages);

// Team management
const teamController = require('../controllers/teamController');
router.get('/teams', teamController.getTeams);
router.get('/teams/:id', teamController.getTeam);
router.post('/teams', roleMiddleware('team:read'), teamController.createTeam);
router.put('/teams/:id', roleMiddleware('team:read'), teamController.updateTeam);
router.delete('/teams/:id', roleMiddleware('team:read'), teamController.deleteTeam);
router.put('/teams/:id/members', roleMiddleware('team:read'), teamController.updateMembers);

module.exports = router;
