const { validationResult } = require('express-validator');
const Job = require('../models/Job');

// GET /api/jobs — list all jobs with filters
const getJobs = async (req, res) => {
    try {
        const { status, department, type, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (department) filter.department = department;
        if (type) filter.type = type;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .populate('postedBy', 'firstName lastName avatar')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Server error fetching jobs' });
    }
};

// GET /api/jobs/:id — get single job
const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName avatar email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ job });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Job not found' });
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/jobs — create job
const createJob = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const jobData = {
            ...req.body,
            postedBy: req.user.id,
        };

        const job = await Job.create(jobData);
        await job.populate('postedBy', 'firstName lastName avatar');

        res.status(201).json({ job });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Server error creating job' });
    }
};

// PUT /api/jobs/:id — update job
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Only allow owner or admin to update
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('postedBy', 'firstName lastName avatar');

        res.json({ job: updated });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Job not found' });
        res.status(500).json({ message: 'Server error updating job' });
    }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Job not found' });
        res.status(500).json({ message: 'Server error deleting job' });
    }
};

// GET /api/jobs/stats/overview
const getJobStats = async (req, res) => {
    try {
        const [total, active, closed, draft] = await Promise.all([
            Job.countDocuments(),
            Job.countDocuments({ status: 'active' }),
            Job.countDocuments({ status: 'closed' }),
            Job.countDocuments({ status: 'draft' }),
        ]);

        res.json({ total, active, closed, draft });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getJobStats };
