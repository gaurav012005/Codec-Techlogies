const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { sendEmailController, sendTemplateEmail } = require('../controllers/emailController');

// All routes require authentication
router.use(auth);

// POST /api/emails/send - Send a raw email
router.post('/send', sendEmailController);

// POST /api/emails/send-template - Send a predefined template email
router.post('/send-template', sendTemplateEmail);

module.exports = router;
