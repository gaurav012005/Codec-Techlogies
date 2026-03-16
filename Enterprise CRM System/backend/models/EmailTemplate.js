const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    bodyHtml: { type: String, default: '' },
    category: {
        type: String,
        enum: ['sales', 'follow_up', 'onboarding', 'meeting', 'proposal', 'nurture', 'other'],
        default: 'other',
    },
    variables: [{ type: String }],
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

emailTemplateSchema.index({ organizationId: 1, category: 1 });
emailTemplateSchema.index({ organizationId: 1, name: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
