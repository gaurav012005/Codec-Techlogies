const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60, min: 15, max: 480 }, // minutes
    type: { type: String, enum: ['phone', 'video', 'onsite', 'technical', 'panel', 'culture'], default: 'video' },
    status: { type: String, enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
    interviewers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        role: String,
    }],
    meetingLink: { type: String },
    location: { type: String },
    notes: { type: String },
    feedback: [{
        interviewer: String,
        rating: { type: Number, min: 1, max: 5 },
        strengths: [String],
        concerns: [String],
        recommendation: { type: String, enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire', 'undecided'] },
        comments: String,
        submittedAt: { type: Date, default: Date.now },
    }],
    overallRating: { type: Number, min: 0, max: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

interviewSchema.index({ scheduledAt: 1, status: 1 });
interviewSchema.index({ candidate: 1, job: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
