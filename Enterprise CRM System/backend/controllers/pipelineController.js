const Pipeline = require('../models/Pipeline');

const DEFAULT_STAGES = [
    { name: 'Prospect', order: 1, probability: 10, color: '#818cf8' },
    { name: 'Qualified', order: 2, probability: 25, color: '#06b6d4' },
    { name: 'Proposal', order: 3, probability: 50, color: '#f59e0b' },
    { name: 'Negotiation', order: 4, probability: 75, color: '#8b5cf6' },
    { name: 'Closed Won', order: 5, probability: 100, color: '#10b981' },
    { name: 'Closed Lost', order: 6, probability: 0, color: '#ef4444' },
];

exports.getPipelines = async (req, res, next) => {
    try {
        let pipelines = await Pipeline.find({ organizationId: req.organizationId });
        // Auto-create default pipeline if none exist
        if (pipelines.length === 0) {
            const defaultPipeline = await Pipeline.create({
                name: 'Default Sales Pipeline',
                description: 'Standard sales process',
                stages: DEFAULT_STAGES,
                isDefault: true,
                organizationId: req.organizationId,
                createdBy: req.user.id,
            });
            pipelines = [defaultPipeline];
        }
        res.json({ success: true, data: pipelines });
    } catch (error) { next(error); }
};

exports.getPipeline = async (req, res, next) => {
    try {
        const pipeline = await Pipeline.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
        res.json({ success: true, data: pipeline });
    } catch (error) { next(error); }
};

exports.createPipeline = async (req, res, next) => {
    try {
        const pipeline = await Pipeline.create({
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user.id,
        });
        res.status(201).json({ success: true, data: pipeline });
    } catch (error) { next(error); }
};

exports.updatePipeline = async (req, res, next) => {
    try {
        const pipeline = await Pipeline.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body, { new: true, runValidators: true }
        );
        if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
        res.json({ success: true, data: pipeline });
    } catch (error) { next(error); }
};

exports.deletePipeline = async (req, res, next) => {
    try {
        const pipeline = await Pipeline.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
        res.json({ success: true, message: 'Pipeline deleted' });
    } catch (error) { next(error); }
};
