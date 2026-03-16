// ============================================
// Exam Routes — /api/exams (Feature 5)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    getExams,
    getExam,
    createExam,
    updateExam,
    setExamQuestions,
    publishExam,
    assignExam,
    deleteExam,
} = require('../controllers/exam.controller');

// All routes require authentication
router.use(authenticate);

// GET  /api/exams     — List all exams (role-filtered)
// POST /api/exams     — Create a new exam (ADMIN, EXAMINER)
router.route('/')
    .get(authorize('ADMIN', 'EXAMINER'), getExams)
    .post(authorize('ADMIN', 'EXAMINER'), createExam);

// GET    /api/exams/:id   — View exam details
// PUT    /api/exams/:id   — Update exam settings
// DELETE /api/exams/:id   — Delete exam (DRAFT/PUBLISHED only)
router.route('/:id')
    .get(authorize('ADMIN', 'EXAMINER'), getExam)
    .put(authorize('ADMIN', 'EXAMINER'), updateExam)
    .delete(authorize('ADMIN', 'EXAMINER'), deleteExam);

// PUT  /api/exams/:id/questions — Replace all questions (ordered array of IDs)
router.put('/:id/questions', authorize('ADMIN', 'EXAMINER'), setExamQuestions);

// POST /api/exams/:id/publish   — Publish exam (must have ≥1 question)
router.post('/:id/publish', authorize('ADMIN', 'EXAMINER'), publishExam);

// POST /api/exams/:id/assign    — Assign exam to students
router.post('/:id/assign', authorize('ADMIN', 'EXAMINER'), assignExam);

module.exports = router;
