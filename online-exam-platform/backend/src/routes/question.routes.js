// ============================================
// Question Routes — /api/questions (Feature 4)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkUpdateStatus,
    getSubjects,
} = require('../controllers/question.controller');

// All routes require authentication
router.use(authenticate);

// GET  /api/questions           — List all (with filters + pagination)
// POST /api/questions           — Create new question
router.route('/')
    .get(authorize('ADMIN', 'EXAMINER'), getQuestions)
    .post(authorize('ADMIN', 'EXAMINER'), createQuestion);

// GET /api/questions/subjects   — Distinct subject list
router.get('/subjects', authorize('ADMIN', 'EXAMINER'), getSubjects);

// PATCH /api/questions/bulk-status — Bulk status change
router.patch('/bulk-status', authorize('ADMIN', 'EXAMINER'), bulkUpdateStatus);

// GET    /api/questions/:id     — Get single question
// PUT    /api/questions/:id     — Update question
// DELETE /api/questions/:id     — Delete question
router.route('/:id')
    .get(authorize('ADMIN', 'EXAMINER'), getQuestion)
    .put(authorize('ADMIN', 'EXAMINER'), updateQuestion)
    .delete(authorize('ADMIN', 'EXAMINER'), deleteQuestion);

module.exports = router;
