const Activity = require('../models/Activity');

exports.getActivities = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { type, userId, page = 1, limit = 30 } = req.query;
        const filter = { organizationId };

        if (type) filter.type = type;
        if (userId) filter.userId = userId;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [activities, total] = await Promise.all([
            Activity.find(filter)
                .populate('userId', 'name email avatar')
                .sort({ createdAt: -1 })
                .skip(skip).limit(parseInt(limit)),
            Activity.countDocuments(filter),
        ]);

        res.json({ success: true, data: { activities, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

exports.getEntityTimeline = async (req, res, next) => {
    try {
        const { entityType, entityId } = req.params;
        const activities = await Activity.find({
            relatedTo: entityId,
            relatedModel: entityType,
            organizationId: req.organizationId,
        })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, data: activities });
    } catch (error) { next(error); }
};

exports.createActivity = async (req, res, next) => {
    try {
        const activity = await Activity.create({
            ...req.body,
            userId: req.user.id,
            organizationId: req.organizationId,
        });
        res.status(201).json({ success: true, data: activity });
    } catch (error) { next(error); }
};
