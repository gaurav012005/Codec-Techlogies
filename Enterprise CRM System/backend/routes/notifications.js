const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const nc = require('../controllers/notificationController');

router.use(auth);
router.use(tenantMiddleware);

router.get('/', nc.getNotifications);
router.get('/unread-count', nc.getUnreadCount);
router.put('/read-all', nc.markAllAsRead);
router.put('/:id/read', nc.markAsRead);
router.delete('/:id', nc.deleteNotification);

module.exports = router;
