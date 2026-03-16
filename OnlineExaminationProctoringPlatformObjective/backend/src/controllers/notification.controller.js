// ============================================
// Notification Controller — Feature 14
// Real-time + Scheduled Notifications
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Get user's notifications (paginated)
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            userId,
            ...(unreadOnly === 'true' ? { read: false } : {}),
        };

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.notification.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                notifications: notifications.map((n) => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    read: n.read,
                    channel: n.channel,
                    createdAt: n.createdAt,
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/notifications/unread-count ─────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user.id, read: false },
        });

        res.json({ success: true, data: { unreadCount: count } });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) throw new AppError('Notification not found', 404);

        await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        res.json({ success: true, message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true },
        });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/notifications/send ────────────────────────────────────────────
// Admin/system sends a notification (can target specific users or all students)
const sendNotification = async (req, res, next) => {
    try {
        const { type, title, message, targetUserIds, targetRole } = req.body;

        if (!title || !message) throw new AppError('Title and message are required', 400);

        let userIds = [];

        if (targetUserIds && targetUserIds.length > 0) {
            // Send to specific users
            userIds = targetUserIds;
        } else if (targetRole) {
            // Send to all users of a specific role
            const users = await prisma.user.findMany({
                where: { role: targetRole, isActive: true },
                select: { id: true },
            });
            userIds = users.map((u) => u.id);
        } else {
            throw new AppError('Specify targetUserIds or targetRole', 400);
        }

        // Create notifications in bulk
        const notifications = await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                type: type || 'EXAM_ASSIGNED',
                title,
                message,
                channel: 'IN_APP',
            })),
        });

        // Emit via Socket.IO if available
        const io = req.app.get('io');
        if (io) {
            userIds.forEach((userId) => {
                io.to(`user:${userId}`).emit('notification', {
                    type: type || 'EXAM_ASSIGNED',
                    title,
                    message,
                    createdAt: new Date().toISOString(),
                });
            });
        }

        res.json({
            success: true,
            data: {
                sentTo: userIds.length,
                created: notifications.count,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) throw new AppError('Notification not found', 404);

        await prisma.notification.delete({ where: { id } });

        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        next(err);
    }
};

// ─── Utility: Create system notification ─────────────────────────────────────
// Called programmatically from other controllers (e.g. on exam publish)
const createSystemNotification = async (io, userId, type, title, message) => {
    try {
        const notification = await prisma.notification.create({
            data: { userId, type, title, message, channel: 'IN_APP' },
        });

        if (io) {
            io.to(`user:${userId}`).emit('notification', {
                id: notification.id,
                type,
                title,
                message,
                createdAt: notification.createdAt,
            });
        }

        return notification;
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    deleteNotification,
    createSystemNotification,
};
