const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

// GET /api/leads
exports.getLeads = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { status, source, ownerId, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

        const filter = { organizationId };

        // Role-based filtering: sales_executive only sees own leads
        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;
        else if (ownerId) filter.ownerId = ownerId;

        if (status) filter.status = status;
        if (source) filter.source = source;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

        const [leads, total] = await Promise.all([
            Lead.find(filter).populate('ownerId', 'name email avatar').populate('assignedTo', 'name email').sort(sort).skip(skip).limit(parseInt(limit)),
            Lead.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: { leads, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
        });
    } catch (error) { next(error); }
};

// GET /api/leads/:id
exports.getLead = async (req, res, next) => {
    try {
        const lead = await Lead.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('ownerId', 'name email avatar')
            .populate('assignedTo', 'name email');

        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        const activities = await Activity.find({ relatedTo: lead._id, relatedModel: 'Lead' })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: { lead, activities } });
    } catch (error) { next(error); }
};

// POST /api/leads
exports.createLead = async (req, res, next) => {
    try {
        const lead = await Lead.create({
            ...req.body,
            ownerId: req.user.id,
            organizationId: req.organizationId,
        });

        // Log activity
        await Activity.create({
            type: 'note', title: `Lead "${lead.name}" created`,
            relatedTo: lead._id, relatedModel: 'Lead',
            userId: req.user.id, organizationId: req.organizationId,
        });

        logger.info(`Lead created: ${lead.name} by ${req.user.email}`);
        res.status(201).json({ success: true, data: lead });
    } catch (error) { next(error); }
};

// PUT /api/leads/:id
exports.updateLead = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, organizationId: req.organizationId };
        if (req.user.role === 'sales_executive') filter.ownerId = req.user.id;

        const oldLead = await Lead.findOne(filter);
        if (!oldLead) return res.status(404).json({ success: false, message: 'Lead not found' });

        const lead = await Lead.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });

        // Log status change
        if (req.body.status && req.body.status !== oldLead.status) {
            await Activity.create({
                type: 'status_change', title: `Status changed: ${oldLead.status} → ${req.body.status}`,
                relatedTo: lead._id, relatedModel: 'Lead',
                userId: req.user.id, organizationId: req.organizationId,
                metadata: { from: oldLead.status, to: req.body.status },
            });
        }

        res.json({ success: true, data: lead });
    } catch (error) { next(error); }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        res.json({ success: true, message: 'Lead deleted' });
    } catch (error) { next(error); }
};

// GET /api/leads/stats
exports.getLeadStats = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const [total, byStatus, bySource] = await Promise.all([
            Lead.countDocuments({ organizationId }),
            Lead.aggregate([
                { $match: { organizationId: new (require('mongoose').Types.ObjectId)(organizationId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Lead.aggregate([
                { $match: { organizationId: new (require('mongoose').Types.ObjectId)(organizationId) } },
                { $group: { _id: '$source', count: { $sum: 1 } } },
            ]),
        ]);
        res.json({ success: true, data: { total, byStatus, bySource } });
    } catch (error) { next(error); }
};
