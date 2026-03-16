const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: 150,
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote', 'full_time', 'part_time'],
        default: 'full-time',
    },
    experience: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'director'],
        default: 'mid',
    },
    salary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
    },
    requirements: [String],
    responsibilities: [String],
    skills: [String],
    benefits: [String],
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'closed', 'archived'],
        default: 'draft',
    },
    pipeline: {
        sourced: { type: Number, default: 0 },
        applied: { type: Number, default: 0 },
        screening: { type: Number, default: 0 },
        interview: { type: Number, default: 0 },
        offered: { type: Number, default: 0 },
        hired: { type: Number, default: 0 },
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    closingDate: {
        type: Date,
    },
    aiScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});

// Virtual for total applicants
jobSchema.virtual('totalApplicants').get(function () {
    const p = this.pipeline;
    return p.sourced + p.applied + p.screening + p.interview + p.offered + p.hired;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

// Indexes
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: 'text', department: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
