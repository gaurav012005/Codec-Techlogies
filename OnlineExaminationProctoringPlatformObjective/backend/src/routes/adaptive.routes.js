// ============================================
// Adaptive Routes — /api/attempts (Feature 11)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getNextAdaptiveQuestion,
    submitAdaptiveAnswer,
} = require('../controllers/adaptive.controller');

// All routes require authentication
router.use(authenticate);

// POST /api/attempts/:attemptId/adaptive/answer — Submit answer & get instant grade
router.post('/:attemptId/adaptive/answer', submitAdaptiveAnswer);

// POST /api/attempts/:attemptId/adaptive/next   — Get next adaptive question
router.post('/:attemptId/adaptive/next', getNextAdaptiveQuestion);

module.exports = router;
