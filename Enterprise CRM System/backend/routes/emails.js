const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const emailController = require('../controllers/emailController');

router.use(auth);
router.use(tenantMiddleware);

// Email CRUD
router.get('/', emailController.getEmails);
router.post('/send', emailController.sendEmail);
router.post('/schedule', emailController.scheduleEmail);
router.get('/threads/:contactId', emailController.getThreads);

// Templates
router.get('/templates', emailController.getTemplates);
router.post('/templates', emailController.createTemplate);
router.put('/templates/:id', emailController.updateTemplate);
router.delete('/templates/:id', emailController.deleteTemplate);

// Tracking (no auth — called by email client)
router.get('/track/:trackingId/open', emailController.trackOpen);
router.get('/track/:trackingId/click', emailController.trackClick);

module.exports = router;
