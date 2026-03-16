// ============================================
// Proctor Routes — /api/proctor  (Feature 8)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    logEvent,
    logBatchEvents,
    getAttemptLogs,
    getExamProctorSummary,
} = require('../controllers/proctor.controller');

router.use(authenticate);

// POST /api/proctor/log           — Student: log a single proctor event
router.post('/log', logEvent);

// POST /api/proctor/log/batch     — Student: bulk log events (on submit)
router.post('/log/batch', logBatchEvents);

// GET  /api/proctor/attempt/:id   — Admin/Examiner: view logs for one attempt
router.get('/attempt/:attemptId', authorize('ADMIN', 'EXAMINER'), getAttemptLogs);

// GET  /api/proctor/exam/:id      — Admin/Examiner: summary for all attempts in exam
router.get('/exam/:examId', authorize('ADMIN', 'EXAMINER'), getExamProctorSummary);

module.exports = router;
