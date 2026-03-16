const { validationResult } = require('express-validator');
const Interview = require('../models/Interview');

// GET /api/interviews
const getInterviews = async (req, res) => {
    try {
        const { status, type, date, startDate, endDate, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (date) {
            const d = new Date(date);
            filter.scheduledAt = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
        }
        if (startDate && endDate) {
            filter.scheduledAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const total = await Interview.countDocuments(filter);
        const interviews = await Interview.find(filter)
            .populate('candidate', 'firstName lastName email headline avatar aiScore')
            .populate('job', 'title department')
            .populate('createdBy', 'firstName lastName')
            .sort({ scheduledAt: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ interviews, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/interviews/:id
const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('candidate', 'firstName lastName email headline avatar aiScore skills')
            .populate('job', 'title department location')
            .populate('createdBy', 'firstName lastName');
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.json({ interview });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/interviews
const createInterview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
        const interview = await Interview.create({ ...req.body, createdBy: req.user.id });
        await interview.populate('candidate', 'firstName lastName email headline');
        await interview.populate('job', 'title department');
        res.status(201).json({ interview });
    } catch (error) {
        console.error('Create interview error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/interviews/:id
const updateInterview = async (req, res) => {
    try {
        const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('candidate', 'firstName lastName email headline')
            .populate('job', 'title department');
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.json({ interview });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findByIdAndDelete(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.json({ message: 'Interview deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/interviews/:id/feedback
const addFeedback = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        interview.feedback.push(req.body);
        const ratings = interview.feedback.filter(f => f.rating).map(f => f.rating);
        if (ratings.length) interview.overallRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await interview.save();
        res.json({ interview });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getInterviews, getInterview, createInterview, updateInterview, deleteInterview, addFeedback };
