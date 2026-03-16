const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['action', 'delay', 'condition'],
        required: true,
    },
    actionType: {
        type: String,
        enum: ['create_task', 'send_email', 'update_field', 'assign_owner', 'create_notification', 'add_tag', ''],
        default: '',
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    delay: {
        amount: { type: Number, default: 0 },
        unit: { type: String, enum: ['minutes', 'hours', 'days', ''], default: '' },
    },
    order: { type: Number, default: 0 },
});

const workflowSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    trigger: {
        type: {
            type: String,
            enum: ['lead_created', 'deal_stage_changed', 'deal_created', 'deal_won', 'deal_lost', 'task_overdue', 'score_threshold', 'email_received', 'manual'],
            required: true,
        },
        conditions: [{
            field: String,
            operator: { type: String, enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains'] },
            value: mongoose.Schema.Types.Mixed,
        }],
    },
    steps: [workflowStepSchema],
    executionCount: { type: Number, default: 0 },
    lastRunAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

workflowSchema.index({ organizationId: 1, isActive: 1 });
workflowSchema.index({ organizationId: 1, 'trigger.type': 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
