const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Utility: Create notification (reusable across the app)
const createNotification = async ({ userId, type, category, title, message, relatedTo, relatedModel, actionUrl, organizationId, metadata }) => {
    try {
        const notification = await Notification.create({
            userId, type, category: category || 'system',
            title, message: message || '',
            relatedTo, relatedModel,
            actionUrl: actionUrl || '',
            metadata: metadata || {},
            organizationId,
        });
        return notification;
    } catch (error) {
        logger.error(`Failed to create notification: ${error.message}`);
        return null;
    }
};

// GET /api/notifications — List user notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const { category, isRead, page = 1, limit = 20 } = req.query;
        const filter = { userId: req.user.id };
        if (category) filter.category = category;
        if (isRead !== undefined) filter.isRead = isRead === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Notification.countDocuments(filter),
            Notification.countDocuments({ userId: req.user.id, isRead: false }),
        ]);

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
            },
        });
    } catch (error) { next(error); }
};

// PUT /api/notifications/:id/read — Mark as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, data: notification });
    } catch (error) { next(error); }
};

// PUT /api/notifications/read-all — Mark all as read
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ success: true, data: { count } });
    } catch (error) { next(error); }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) { next(error); }
};

// Export utility
exports.createNotification = createNotification;
