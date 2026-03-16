// ============================================
// Analytics Routes — /api/analytics (Feature 12)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    getDashboardAnalytics,
    getExamAnalytics,
    getGradingQueue,
    gradeAnswer,
    getExamsList,
} = require('../controllers/analytics.controller');

// All analytics routes require authentication + admin/examiner role
router.use(authenticate);
router.use(authorize('ADMIN', 'EXAMINER'));

// GET  /api/analytics/dashboard          — Aggregate dashboard stats
router.get('/dashboard', getDashboardAnalytics);

// GET  /api/analytics/exams-list         — Exam list for selector dropdown
router.get('/exams-list', getExamsList);

// GET  /api/analytics/exam/:examId       — Detailed exam analytics
router.get('/exam/:examId', getExamAnalytics);

// GET  /api/analytics/grading-queue      — Short-answer grading queue
router.get('/grading-queue', getGradingQueue);

// PUT  /api/analytics/grade/:answerId    — Manually grade an answer
router.put('/grade/:answerId', gradeAnswer);

module.exports = router;
