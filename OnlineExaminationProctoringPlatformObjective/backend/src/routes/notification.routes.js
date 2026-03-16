// ============================================
// Notification Routes — /api/notifications (Feature 14)
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    deleteNotification,
} = require('../controllers/notification.controller');

// All routes require authentication
router.use(authenticate);

// GET  /api/notifications              — Get user's notifications
router.get('/', getNotifications);

// GET  /api/notifications/unread-count  — Get unread count
router.get('/unread-count', getUnreadCount);

// PUT  /api/notifications/read-all      — Mark all as read
router.put('/read-all', markAllAsRead);

// PUT  /api/notifications/:id/read      — Mark single as read
router.put('/:id/read', markAsRead);

// POST /api/notifications/send          — Send notification (admin only)
router.post('/send', authorize('ADMIN', 'EXAMINER'), sendNotification);

// DELETE /api/notifications/:id         — Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;
