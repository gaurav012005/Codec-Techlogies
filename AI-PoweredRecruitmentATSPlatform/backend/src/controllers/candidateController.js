const { validationResult } = require('express-validator');
const Candidate = require('../models/Candidate');

// GET /api/candidates
const getCandidates = async (req, res) => {
    try {
        const { search, source, status, stage, sort = '-aiScore', page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (source) filter.source = source;
        if (stage) filter['appliedJobs.stage'] = stage;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { headline: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Candidate.countDocuments(filter);
        const candidates = await Candidate.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ candidates, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/candidates/:id
const getCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('appliedJobs.job', 'title department status');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json({ candidate });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Candidate not found' });
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/candidates
const createCandidate = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
        const candidate = await Candidate.create(req.body);
        res.status(201).json({ candidate });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Candidate with this email already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/candidates/:id
const updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json({ candidate });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Candidate not found' });
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json({ message: 'Candidate deleted' });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ message: 'Candidate not found' });
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate };
