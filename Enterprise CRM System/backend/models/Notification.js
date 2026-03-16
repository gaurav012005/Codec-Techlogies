const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['deal_update', 'task_assigned', 'task_due', 'lead_scored', 'mention', 'system', 'email', 'workflow'],
        required: true,
    },
    category: {
        type: String,
        enum: ['tasks', 'deals', 'system', 'mentions', 'emails'],
        default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    relatedTo: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ['Lead', 'Contact', 'Deal', 'Task', 'Email', 'Workflow', ''] },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
