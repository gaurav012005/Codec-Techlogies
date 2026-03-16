const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
        type: String,
        enum: ['call', 'email', 'meeting', 'follow_up', 'demo', 'proposal', 'general'],
        default: 'general',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    relatedTo: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ['Lead', 'Contact', 'Deal', 'Company', ''] },
    isAutomated: { type: Boolean, default: false },
    triggerEvent: { type: String, default: '' },
    tags: [{ type: String }],
    reminder: { type: Date },
}, { timestamps: true });

taskSchema.index({ organizationId: 1, assignedTo: 1, status: 1 });
taskSchema.index({ organizationId: 1, dueDate: 1 });
taskSchema.index({ organizationId: 1, status: 1, priority: 1 });
taskSchema.index({ relatedTo: 1, relatedModel: 1 });

module.exports = mongoose.model('Task', taskSchema);
