const mongoose = require('mongoose');

const executionStepSchema = new mongoose.Schema({
    stepId: { type: mongoose.Schema.Types.ObjectId },
    stepOrder: { type: Number, default: 0 },
    type: { type: String, default: '' },
    actionType: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
        default: 'pending',
    },
    executedAt: { type: Date },
    completedAt: { type: Date },
    result: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String, default: '' },
});

const workflowExecutionSchema = new mongoose.Schema({
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    workflowName: { type: String, default: '' },
    triggeredBy: {
        type: { type: String, default: 'system' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        entityId: { type: mongoose.Schema.Types.ObjectId },
        entityType: { type: String, default: '' },
    },
    triggerData: { type: mongoose.Schema.Types.Mixed, default: {} },
    steps: [executionStepSchema],
    status: {
        type: String,
        enum: ['running', 'completed', 'failed', 'cancelled'],
        default: 'running',
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

workflowExecutionSchema.index({ workflowId: 1, status: 1 });
workflowExecutionSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkflowExecution', workflowExecutionSchema);
