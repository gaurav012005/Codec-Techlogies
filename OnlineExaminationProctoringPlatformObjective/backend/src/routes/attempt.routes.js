// ============================================
// Attempt Routes — /api/attempts  (Feature 6)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    startAttempt,
    saveAnswer,
    submitAttempt,
    getAttemptResult,
} = require('../controllers/attempt.controller');

// All routes require authentication
router.use(authenticate);

// POST /api/attempts/start        — Start or resume an exam attempt
router.post('/start', startAttempt);

// POST /api/attempts/:id/answer   — Auto-save one answer
router.post('/:attemptId/answer', saveAnswer);

// POST /api/attempts/:id/submit   — Submit exam, trigger auto-grade
router.post('/:attemptId/submit', submitAttempt);

// GET  /api/attempts/:id          — Get attempt result
router.get('/:attemptId', getAttemptResult);

module.exports = router;
