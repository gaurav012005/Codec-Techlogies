const Workflow = require('../models/Workflow');
const WorkflowExecution = require('../models/WorkflowExecution');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const { createNotification } = require('../controllers/notificationController');
const { emitNotification } = require('../config/socket');
const logger = require('./logger');

/**
 * Workflow Automation Engine
 * Evaluates triggers, checks conditions, and executes action steps.
 */

// ─── Condition Evaluator ───────────────────────────
const evaluateCondition = (condition, data) => {
    const { field, operator, value } = condition;
    const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], data);

    switch (operator) {
        case 'equals': return String(fieldValue) === String(value);
        case 'not_equals': return String(fieldValue) !== String(value);
        case 'greater_than': return Number(fieldValue) > Number(value);
        case 'less_than': return Number(fieldValue) < Number(value);
        case 'contains': return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
        case 'not_contains': return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
        default: return true;
    }
};

const evaluateConditions = (conditions, data) => {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every(c => evaluateCondition(c, data));
};

// ─── Action Executors ───────────────────────────
const executeAction = async (step, triggerData, organizationId) => {
    const { actionType, config } = step;

    switch (actionType) {
        case 'create_task': {
            const task = await Task.create({
                title: config.title || 'Auto-generated task',
                description: config.description || `Created by workflow automation`,
                type: config.taskType || 'follow_up',
                priority: config.priority || 'medium',
                assignedTo: config.assignTo || triggerData.userId || triggerData.ownerId,
                createdBy: config.assignTo || triggerData.userId || triggerData.ownerId,
                organizationId,
                relatedTo: triggerData.entityId,
                relatedModel: triggerData.entityType,
                dueDate: config.dueDays
                    ? new Date(Date.now() + config.dueDays * 86400000)
                    : new Date(Date.now() + 86400000),
                isAutomated: true,
                triggerEvent: triggerData.triggerType,
            });
            return { taskId: task._id, title: task.title };
        }

        case 'create_notification': {
            const notification = await createNotification({
                userId: config.notifyUserId || triggerData.userId || triggerData.ownerId,
                type: 'workflow',
                category: 'system',
                title: config.title || 'Workflow Notification',
                message: config.message || `Triggered by ${triggerData.triggerType}`,
                relatedTo: triggerData.entityId,
                relatedModel: triggerData.entityType,
                organizationId,
            });
            if (notification) {
                emitNotification(notification.userId, notification);
            }
            return { notificationId: notification?._id };
        }

        case 'update_field': {
            const Model = triggerData.entityType === 'Deal' ? Deal
                : triggerData.entityType === 'Lead' ? Lead : null;
            if (Model && triggerData.entityId) {
                await Model.findByIdAndUpdate(triggerData.entityId, {
                    [config.field]: config.value,
                });
                return { field: config.field, value: config.value };
            }
            return { skipped: true, reason: 'No model or entity ID' };
        }

        case 'assign_owner': {
            const Model = triggerData.entityType === 'Deal' ? Deal
                : triggerData.entityType === 'Lead' ? Lead : null;
            if (Model && triggerData.entityId && config.newOwnerId) {
                await Model.findByIdAndUpdate(triggerData.entityId, {
                    ownerId: config.newOwnerId,
                });
                return { assignedTo: config.newOwnerId };
            }
            return { skipped: true };
        }

        case 'add_tag': {
            const Model = triggerData.entityType === 'Deal' ? Deal
                : triggerData.entityType === 'Lead' ? Lead : null;
            if (Model && triggerData.entityId && config.tag) {
                await Model.findByIdAndUpdate(triggerData.entityId, {
                    $addToSet: { tags: config.tag },
                });
                return { tag: config.tag };
            }
            return { skipped: true };
        }

        case 'send_email': {
            // Log the email action (actual sending is handled by email controller)
            return { queued: true, to: config.to, subject: config.subject };
        }

        default:
            return { skipped: true, reason: `Unknown action: ${actionType}` };
    }
};

// ─── Workflow Runner ───────────────────────────
const runWorkflow = async (workflow, triggerData) => {
    const execution = await WorkflowExecution.create({
        workflowId: workflow._id,
        workflowName: workflow.name,
        triggeredBy: {
            type: triggerData.triggerType || 'system',
            userId: triggerData.userId,
            entityId: triggerData.entityId,
            entityType: triggerData.entityType,
        },
        triggerData,
        steps: workflow.steps.map((s, i) => ({
            stepId: s._id,
            stepOrder: s.order || i,
            type: s.type,
            actionType: s.actionType || '',
            status: 'pending',
        })),
        status: 'running',
        organizationId: workflow.organizationId,
    });

    try {
        // Execute steps sequentially
        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const execStep = execution.steps[i];

            execStep.status = 'running';
            execStep.executedAt = new Date();
            await execution.save();

            try {
                if (step.type === 'delay') {
                    // For delays, we mark as completed immediately
                    // In production, this would use Bull delayed jobs
                    const delayMs = (step.delay?.amount || 0) *
                        (step.delay?.unit === 'days' ? 86400000 :
                            step.delay?.unit === 'hours' ? 3600000 : 60000);
                    execStep.result = { delayMs, unit: step.delay?.unit, amount: step.delay?.amount };
                    execStep.status = 'completed';
                    execStep.completedAt = new Date();
                } else if (step.type === 'condition') {
                    const passed = evaluateConditions(step.config?.conditions || [], triggerData);
                    execStep.result = { conditionPassed: passed };
                    execStep.status = 'completed';
                    execStep.completedAt = new Date();
                    if (!passed) {
                        // Skip remaining steps
                        for (let j = i + 1; j < execution.steps.length; j++) {
                            execution.steps[j].status = 'skipped';
                        }
                        break;
                    }
                } else if (step.type === 'action') {
                    const result = await executeAction(step, triggerData, workflow.organizationId);
                    execStep.result = result;
                    execStep.status = 'completed';
                    execStep.completedAt = new Date();
                }
            } catch (stepError) {
                execStep.status = 'failed';
                execStep.error = stepError.message;
                execStep.completedAt = new Date();
                logger.error(`Workflow step ${i} failed: ${stepError.message}`);
            }

            await execution.save();
        }

        execution.status = execution.steps.some(s => s.status === 'failed') ? 'failed' : 'completed';
        execution.completedAt = new Date();
        await execution.save();

        // Update workflow counters
        await Workflow.findByIdAndUpdate(workflow._id, {
            $inc: { executionCount: 1 },
            lastRunAt: new Date(),
        });

        logger.info(`Workflow "${workflow.name}" executed: ${execution.status}`);
        return execution;
    } catch (error) {
        execution.status = 'failed';
        execution.completedAt = new Date();
        await execution.save();
        logger.error(`Workflow "${workflow.name}" execution failed: ${error.message}`);
        return execution;
    }
};

// ─── Trigger Handler ───────────────────────────
const handleTrigger = async (triggerType, triggerData, organizationId) => {
    try {
        const workflows = await Workflow.find({
            organizationId,
            isActive: true,
            'trigger.type': triggerType,
        });

        if (workflows.length === 0) return [];

        const executions = [];
        for (const workflow of workflows) {
            // Check trigger conditions
            if (evaluateConditions(workflow.trigger.conditions, triggerData)) {
                const execution = await runWorkflow(workflow, { ...triggerData, triggerType });
                executions.push(execution);
            }
        }

        return executions;
    } catch (error) {
        logger.error(`Trigger handler error for ${triggerType}: ${error.message}`);
        return [];
    }
};

module.exports = {
    handleTrigger,
    runWorkflow,
    evaluateConditions,
};
