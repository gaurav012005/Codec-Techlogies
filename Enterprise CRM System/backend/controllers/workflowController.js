const Workflow = require('../models/Workflow');
const WorkflowExecution = require('../models/WorkflowExecution');
const { handleTrigger } = require('../utils/workflowEngine');
const logger = require('../utils/logger');

// GET /api/workflows — List all workflows
exports.getWorkflows = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = { organizationId: req.organizationId };
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        const workflows = await Workflow.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Workflow.countDocuments(filter);

        res.json({
            success: true,
            data: {
                workflows,
                pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        logger.error('Get workflows error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch workflows' });
    }
};

// GET /api/workflows/:id — Get single workflow
exports.getWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('createdBy', 'name email');

        if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

        res.json({ success: true, data: workflow });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch workflow' });
    }
};

// POST /api/workflows — Create workflow
exports.createWorkflow = async (req, res) => {
    try {
        const { name, description, trigger, steps } = req.body;

        const workflow = await Workflow.create({
            name,
            description,
            trigger,
            steps: (steps || []).map((s, i) => ({ ...s, order: i })),
            createdBy: req.user._id,
            organizationId: req.organizationId,
        });

        res.status(201).json({ success: true, data: workflow });
    } catch (error) {
        logger.error('Create workflow error:', error);
        res.status(500).json({ success: false, message: 'Failed to create workflow' });
    }
};

// PUT /api/workflows/:id — Update workflow
exports.updateWorkflow = async (req, res) => {
    try {
        const { name, description, trigger, steps, isActive } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (trigger !== undefined) updateData.trigger = trigger;
        if (steps !== undefined) updateData.steps = steps.map((s, i) => ({ ...s, order: i }));
        if (isActive !== undefined) updateData.isActive = isActive;

        const workflow = await Workflow.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            updateData,
            { new: true }
        );

        if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

        res.json({ success: true, data: workflow });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update workflow' });
    }
};

// DELETE /api/workflows/:id — Delete workflow
exports.deleteWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

        // Clean up executions
        await WorkflowExecution.deleteMany({ workflowId: req.params.id });

        res.json({ success: true, message: 'Workflow deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete workflow' });
    }
};

// PUT /api/workflows/:id/toggle — Toggle active/inactive
exports.toggleWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

        workflow.isActive = !workflow.isActive;
        await workflow.save();

        res.json({ success: true, data: { isActive: workflow.isActive } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle workflow' });
    }
};

// POST /api/workflows/:id/test — Test run a workflow
exports.testWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

        const testData = req.body.triggerData || {
            entityId: null,
            entityType: 'Lead',
            userId: req.user._id,
            triggerType: workflow.trigger.type,
            testRun: true,
        };

        const { runWorkflow } = require('../utils/workflowEngine');
        const execution = await runWorkflow(workflow, testData);

        res.json({ success: true, data: execution });
    } catch (error) {
        logger.error('Test workflow error:', error);
        res.status(500).json({ success: false, message: 'Failed to test workflow' });
    }
};

// GET /api/workflows/:id/executions — Get execution logs
exports.getExecutions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = { workflowId: req.params.id, organizationId: req.organizationId };
        if (status) filter.status = status;

        const executions = await WorkflowExecution.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await WorkflowExecution.countDocuments(filter);

        res.json({
            success: true,
            data: {
                executions,
                pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch executions' });
    }
};

// GET /api/workflows/analytics — Workflow analytics summary
exports.getAnalytics = async (req, res) => {
    try {
        const [workflows, recentExecutions, statusCounts] = await Promise.all([
            Workflow.find({ organizationId: req.organizationId }).select('name isActive executionCount lastRunAt'),
            WorkflowExecution.find({ organizationId: req.organizationId }).sort({ createdAt: -1 }).limit(10),
            WorkflowExecution.aggregate([
                { $match: { organizationId: req.organizationId } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);

        const totalRuns = statusCounts.reduce((sum, s) => sum + s.count, 0);
        const successRuns = statusCounts.find(s => s._id === 'completed')?.count || 0;
        const failedRuns = statusCounts.find(s => s._id === 'failed')?.count || 0;

        res.json({
            success: true,
            data: {
                totalWorkflows: workflows.length,
                activeWorkflows: workflows.filter(w => w.isActive).length,
                totalRuns,
                successRate: totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0,
                failedRuns,
                recentExecutions,
                workflows,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};
