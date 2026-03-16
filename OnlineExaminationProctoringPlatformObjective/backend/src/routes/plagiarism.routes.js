// ============================================
// Plagiarism Routes — /api/plagiarism (Feature 13)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    runPlagiarismCheck,
    getPlagiarismReport,
    setVerdict,
} = require('../controllers/plagiarism.controller');

// All plagiarism routes require admin/examiner
router.use(authenticate);
router.use(authorize('ADMIN', 'EXAMINER'));

// POST /api/plagiarism/run/:examId    — Run plagiarism check
router.post('/run/:examId', runPlagiarismCheck);

// GET  /api/plagiarism/report/:examId — Get latest report
router.get('/report/:examId', getPlagiarismReport);

// PUT  /api/plagiarism/verdict/:flagId — Set admin verdict
router.put('/verdict/:flagId', setVerdict);

module.exports = router;
