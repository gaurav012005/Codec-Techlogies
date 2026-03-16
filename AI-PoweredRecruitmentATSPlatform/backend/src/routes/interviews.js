const express = require('express');
const { body } = require('express-validator');
const { getInterviews, getInterview, createInterview, updateInterview, deleteInterview, addFeedback } = require('../controllers/interviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/', [
    body('candidate').notEmpty().withMessage('Candidate is required'),
    body('job').notEmpty().withMessage('Job is required'),
    body('scheduledAt').notEmpty().withMessage('Scheduled date/time is required'),
], createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/feedback', addFeedback);

module.exports = router;
