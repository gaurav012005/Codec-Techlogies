const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    bodyHtml: { type: String, default: '' },
    threadId: { type: String, default: '' },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
    status: {
        type: String,
        enum: ['draft', 'queued', 'sent', 'delivered', 'failed', 'scheduled'],
        default: 'draft',
    },
    direction: { type: String, enum: ['outbound', 'inbound'], default: 'outbound' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    trackingId: { type: String, unique: true, sparse: true },
    sequenceStep: { type: Number, default: 0 },
    sequenceId: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

emailSchema.index({ organizationId: 1, contactId: 1, createdAt: -1 });
emailSchema.index({ organizationId: 1, threadId: 1 });
emailSchema.index({ organizationId: 1, userId: 1 });
emailSchema.index({ trackingId: 1 });
emailSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Email', emailSchema);
