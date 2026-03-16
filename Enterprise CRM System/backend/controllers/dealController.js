const Deal = require('../models/Deal');
const Pipeline = require('../models/Pipeline');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

// GET /api/deals
exports.getDeals = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { pipelineId, stage, status, ownerId, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;
        const filter = { organizationId };

        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;
        else if (ownerId) filter.ownerId = ownerId;

        if (pipelineId) filter.pipelineId = pipelineId;
        if (stage) filter.stage = stage;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [deals, total] = await Promise.all([
            Deal.find(filter)
                .populate('ownerId', 'name email avatar')
                .populate('contactId', 'name email')
                .populate('companyId', 'name')
                .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
                .skip(skip).limit(parseInt(limit)),
            Deal.countDocuments(filter),
        ]);

        res.json({ success: true, data: { deals, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

// GET /api/deals/board/:pipelineId — Kanban board data
exports.getDealBoard = async (req, res, next) => {
    try {
        const pipeline = await Pipeline.findOne({ _id: req.params.pipelineId, organizationId: req.organizationId });
        if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });

        const filter = { organizationId: req.organizationId, pipelineId: pipeline._id, status: 'open' };
        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;

        const deals = await Deal.find(filter)
            .populate('ownerId', 'name avatar')
            .populate('contactId', 'name')
            .populate('companyId', 'name')
            .sort({ updatedAt: -1 });

        // Group deals by stage
        const columns = {};
        pipeline.stages.forEach((s) => {
            columns[s.name] = { stage: s, deals: [] };
        });
        deals.forEach((d) => {
            if (columns[d.stage]) columns[d.stage].deals.push(d);
        });

        res.json({ success: true, data: { pipeline, columns } });
    } catch (error) { next(error); }
};

// GET /api/deals/:id
exports.getDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('ownerId', 'name email avatar')
            .populate('contactId', 'name email phone')
            .populate('companyId', 'name industry')
            .populate('pipelineId', 'name stages');
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

        const activities = await Activity.find({ relatedTo: deal._id, relatedModel: 'Deal' })
            .populate('userId', 'name avatar').sort({ createdAt: -1 }).limit(30);

        res.json({ success: true, data: { deal, activities } });
    } catch (error) { next(error); }
};

// POST /api/deals
exports.createDeal = async (req, res, next) => {
    try {
        // Get probability from pipeline stage
        const pipeline = await Pipeline.findById(req.body.pipelineId);
        if (!pipeline) return res.status(400).json({ success: false, message: 'Invalid pipeline' });

        const stageData = pipeline.stages.find(s => s.name === req.body.stage);

        const deal = await Deal.create({
            ...req.body,
            probability: stageData?.probability || 0,
            ownerId: req.user.id,
            organizationId: req.organizationId,
            stageHistory: [{ stage: req.body.stage, enteredAt: new Date() }],
        });

        await Activity.create({
            type: 'note', title: `Deal "${deal.title}" created (${deal.stage})`,
            relatedTo: deal._id, relatedModel: 'Deal',
            userId: req.user.id, organizationId: req.organizationId,
        });

        logger.info(`Deal created: ${deal.title} ($${deal.value})`);
        res.status(201).json({ success: true, data: deal });
    } catch (error) { next(error); }
};

// PUT /api/deals/:id
exports.updateDeal = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, organizationId: req.organizationId };
        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;

        const oldDeal = await Deal.findOne(filter);
        if (!oldDeal) return res.status(404).json({ success: false, message: 'Deal not found' });

        // If stage changed, update probability and history
        if (req.body.stage && req.body.stage !== oldDeal.stage) {
            const pipeline = await Pipeline.findById(oldDeal.pipelineId);
            const stageData = pipeline?.stages.find(s => s.name === req.body.stage);
            req.body.probability = stageData?.probability || req.body.probability || oldDeal.probability;

            // Update stage history
            const history = oldDeal.stageHistory || [];
            if (history.length > 0) {
                history[history.length - 1].exitedAt = new Date();
            }
            history.push({ stage: req.body.stage, enteredAt: new Date() });
            req.body.stageHistory = history;

            // Auto-set status for win/loss stages
            if (req.body.stage === 'Closed Won') {
                req.body.status = 'won';
                req.body.actualCloseDate = new Date();
            } else if (req.body.stage === 'Closed Lost') {
                req.body.status = 'lost';
                req.body.actualCloseDate = new Date();
            }

            await Activity.create({
                type: 'status_change', title: `Stage: ${oldDeal.stage} → ${req.body.stage}`,
                relatedTo: oldDeal._id, relatedModel: 'Deal',
                userId: req.user.id, organizationId: req.organizationId,
                metadata: { from: oldDeal.stage, to: req.body.stage },
            });
        }

        const deal = await Deal.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: deal });
    } catch (error) { next(error); }
};

// PUT /api/deals/:id/stage — Simplified stage move for Kanban drag
exports.moveDealStage = async (req, res, next) => {
    try {
        req.body = { stage: req.body.stage };
        return exports.updateDeal(req, res, next);
    } catch (error) { next(error); }
};

// DELETE /api/deals/:id
exports.deleteDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        res.json({ success: true, message: 'Deal deleted' });
    } catch (error) { next(error); }
};

// GET /api/deals/forecast
exports.getForecast = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        const { organizationId } = req;
        const openDeals = await Deal.find({ organizationId, status: 'open' });

        const totalPipeline = openDeals.reduce((sum, d) => sum + d.value, 0);
        const weightedForecast = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
        const bestCase = openDeals.reduce((sum, d) => sum + (d.probability >= 25 ? d.value : 0), 0);
        const worstCase = openDeals.reduce((sum, d) => sum + (d.probability >= 75 ? d.value : 0), 0);

        const wonDeals = await Deal.find({ organizationId, status: 'won' });
        const totalWon = wonDeals.reduce((sum, d) => sum + d.value, 0);
        const dealCount = { open: openDeals.length, won: wonDeals.length, total: openDeals.length + wonDeals.length };

        res.json({ success: true, data: { totalPipeline, weightedForecast, bestCase, worstCase, totalWon, dealCount } });
    } catch (error) { next(error); }
};

// GET /api/deals/:id/prediction — AI Win Prediction
exports.getDealPrediction = async (req, res, next) => {
    try {
        const deal = await Deal.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

        const { predictDealWin, getClassification } = require('../utils/dealPrediction');
        const prediction = await predictDealWin(deal, req.organizationId);
        const classification = getClassification(prediction.probability);

        res.json({
            success: true,
            data: {
                dealId: deal._id,
                dealTitle: deal.title,
                currentStage: deal.stage,
                currentProbability: deal.probability,
                prediction: {
                    ...prediction,
                    classification,
                },
            },
        });
    } catch (error) { next(error); }
};

