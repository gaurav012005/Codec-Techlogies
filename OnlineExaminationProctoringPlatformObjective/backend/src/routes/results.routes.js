// ============================================
// Results Routes — /api/results  (Feature 7)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    getMyResults,
    getResultDetail,
    getLeaderboard,
    getExamStats,
} = require('../controllers/results.controller');

router.use(authenticate);

// GET /api/results/my                       — Student: list all my results
router.get('/my', getMyResults);

// GET /api/results/:attemptId               — Full detail (student own, or admin)
router.get('/:attemptId', getResultDetail);

// GET /api/results/exam/:examId/leaderboard — Admin/Examiner only
router.get('/exam/:examId/leaderboard', authorize('ADMIN', 'EXAMINER'), getLeaderboard);

// GET /api/results/exam/:examId/stats       — Admin/Examiner only
router.get('/exam/:examId/stats', authorize('ADMIN', 'EXAMINER'), getExamStats);

module.exports = router;
