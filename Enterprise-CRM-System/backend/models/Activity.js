const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['call', 'email', 'meeting', 'note', 'status_change', 'task', 'file_upload'],
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    outcome: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    relatedTo: { type: mongoose.Schema.Types.ObjectId, required: true },
    relatedModel: { type: String, enum: ['Lead', 'Contact', 'Deal', 'Company'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

activitySchema.index({ relatedTo: 1, relatedModel: 1, createdAt: -1 });
activitySchema.index({ organizationId: 1, userId: 1 });
activitySchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
