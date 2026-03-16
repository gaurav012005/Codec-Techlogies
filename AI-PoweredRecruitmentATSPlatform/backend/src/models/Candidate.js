const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    avatar: { type: String, default: '' },
    headline: { type: String, trim: true, maxlength: 200 },
    summary: { type: String },
    experience: [{
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
    }],
    education: [{
        degree: String,
        institution: String,
        field: String,
        startDate: Date,
        endDate: Date,
    }],
    skills: [{ name: String, level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] } }],
    languages: [{ name: String, proficiency: String }],
    resumeUrl: { type: String },
    resumeParsed: { type: Boolean, default: false },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
    },
    source: { type: String, enum: ['linkedin', 'indeed', 'referral', 'direct', 'job_board', 'other'], default: 'direct' },
    aiScore: { type: Number, default: 0, min: 0, max: 100 },
    aiAnalysis: {
        strengths: [String],
        gaps: [String],
        cultureFit: { type: Number, min: 0, max: 100 },
        technicalFit: { type: Number, min: 0, max: 100 },
        experienceFit: { type: Number, min: 0, max: 100 },
    },
    appliedJobs: [{
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        stage: { type: String, enum: ['sourced', 'applied', 'screening', 'interview', 'offered', 'hired', 'rejected'], default: 'applied' },
        appliedAt: { type: Date, default: Date.now },
        notes: String,
    }],
    tags: [String],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    status: { type: String, enum: ['active', 'archived', 'blacklisted'], default: 'active' },
}, { timestamps: true });

candidateSchema.index({ firstName: 'text', lastName: 'text', email: 'text', 'skills.name': 'text' });

module.exports = mongoose.model('Candidate', candidateSchema);
