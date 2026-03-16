const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    source: {
        type: String,
        enum: ['website', 'referral', 'linkedin', 'cold_call', 'email', 'event', 'advertisement', 'other'],
        default: 'other',
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'unqualified', 'nurturing', 'converted', 'lost'],
        default: 'new',
    },
    leadScore: { type: Number, default: 0, min: 0, max: 100 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    convertedAt: { type: Date },
    convertedToContactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    convertedToDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
}, { timestamps: true });

leadSchema.index({ organizationId: 1, ownerId: 1 });
leadSchema.index({ organizationId: 1, status: 1 });
leadSchema.index({ organizationId: 1, leadScore: -1 });
leadSchema.index({ organizationId: 1, createdAt: -1 });
leadSchema.index({ '$**': 'text' });

module.exports = mongoose.model('Lead', leadSchema);
