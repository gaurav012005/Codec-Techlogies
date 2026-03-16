const express = require('express');
const { body } = require('express-validator');
const { getJobs, getJob, createJob, updateJob, deleteJob, getJobStats } = require('../controllers/jobController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Stats endpoint (before :id to avoid matching)
router.get('/stats/overview', getJobStats);

// GET /api/jobs
router.get('/', getJobs);

// GET /api/jobs/:id
router.get('/:id', getJob);

// POST /api/jobs
router.post('/', [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
], createJob);

// PUT /api/jobs/:id
router.put('/:id', updateJob);

// DELETE /api/jobs/:id
router.delete('/:id', deleteJob);

module.exports = router;
