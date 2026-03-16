// ============================================
// Exam Routes — /api/exams  (Feature 6+)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getAssignedExams } = require('../controllers/attempt.controller');

// All routes require auth
router.use(authenticate);

// GET /api/exams/assigned — Student: get assigned & published exams
router.get('/assigned', authorize('STUDENT', 'ADMIN', 'EXAMINER'), getAssignedExams);

// Placeholder for future exam CRUD (Feature 5 fully integrated here)
router.get('/', (req, res) => {
    res.json({ success: true, message: 'Exam list — see /api/exams/assigned for student view' });
});

module.exports = router;
