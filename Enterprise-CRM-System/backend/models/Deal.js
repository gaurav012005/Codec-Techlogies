const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    value: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    stage: { type: String, required: true },
    pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    expectedCloseDate: { type: Date },
    actualCloseDate: { type: Date },
    status: {
        type: String,
        enum: ['open', 'won', 'lost'],
        default: 'open',
    },
    winLossReason: { type: String, default: '' },
    competitorInfo: { type: String, default: '' },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    stageHistory: [{
        stage: String,
        enteredAt: { type: Date, default: Date.now },
        exitedAt: Date,
    }],
}, { timestamps: true });

dealSchema.index({ organizationId: 1, pipelineId: 1, stage: 1 });
dealSchema.index({ organizationId: 1, ownerId: 1 });
dealSchema.index({ organizationId: 1, status: 1 });
dealSchema.index({ organizationId: 1, expectedCloseDate: 1 });
dealSchema.index({ organizationId: 1, companyId: 1 });

module.exports = mongoose.model('Deal', dealSchema);
