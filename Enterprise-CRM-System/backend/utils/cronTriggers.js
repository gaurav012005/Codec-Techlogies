const Deal = require('../models/Deal');
const Task = require('../models/Task');
const { handleTrigger } = require('./workflowEngine');
const { createNotification } = require('../controllers/notificationController');
const logger = require('./logger');

/**
 * Cron-based recurring triggers for workflow automation
 * These should be called from a Bull cron job or setInterval
 */

// Check for stale deals (same stage > 14 days)
const checkStaleDealTriggers = async () => {
    try {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
        const staleDeals = await Deal.find({
            status: 'open',
            updatedAt: { $lt: fourteenDaysAgo },
        }).populate('organizationId');

        for (const deal of staleDeals) {
            await handleTrigger('deal_stage_changed', {
                entityId: deal._id,
                entityType: 'Deal',
                userId: deal.ownerId,
                ownerId: deal.ownerId,
                dealValue: deal.value,
                stage: deal.stage,
                stale: true,
            }, deal.organizationId);
        }

        if (staleDeals.length > 0) {
            logger.info(`Stale deal check: found ${staleDeals.length} stale deals`);
        }
    } catch (error) {
        logger.error('Stale deal trigger error:', error.message);
    }
};

// Check for overdue tasks
const checkOverdueTaskTriggers = async () => {
    try {
        const now = new Date();
        const overdueTasks = await Task.find({
            status: { $ne: 'completed' },
            dueDate: { $lt: now },
            _overdueNotified: { $ne: true },
        });

        for (const task of overdueTasks) {
            await handleTrigger('task_overdue', {
                entityId: task._id,
                entityType: 'Task',
                userId: task.assignedTo,
                ownerId: task.assignedTo,
                taskTitle: task.title,
            }, task.organizationId);

            // Mark as notified to avoid duplicate triggers
            task._overdueNotified = true;
            await task.save();
        }

        if (overdueTasks.length > 0) {
            logger.info(`Overdue task check: found ${overdueTasks.length} overdue tasks`);
        }
    } catch (error) {
        logger.error('Overdue task trigger error:', error.message);
    }
};

// Daily digest — summary of pending items
const runDailyDigest = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueTodayTasks = await Task.find({
            status: { $ne: 'completed' },
            dueDate: { $gte: today, $lt: tomorrow },
        });

        // Group by user
        const userTasks = {};
        dueTodayTasks.forEach(task => {
            const userId = task.assignedTo?.toString();
            if (userId) {
                if (!userTasks[userId]) userTasks[userId] = [];
                userTasks[userId].push(task);
            }
        });

        for (const [userId, tasks] of Object.entries(userTasks)) {
            await createNotification({
                userId,
                type: 'digest',
                category: 'system',
                title: 'Daily Digest',
                message: `You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due today`,
                organizationId: tasks[0].organizationId,
            });
        }

        logger.info(`Daily digest sent to ${Object.keys(userTasks).length} users`);
    } catch (error) {
        logger.error('Daily digest error:', error.message);
    }
};

// Initialize cron jobs (call this from server startup)
const initCronTriggers = () => {
    // Run stale deal check every 6 hours
    setInterval(checkStaleDealTriggers, 6 * 60 * 60 * 1000);

    // Run overdue task check every hour
    setInterval(checkOverdueTaskTriggers, 60 * 60 * 1000);

    // Run daily digest at startup and then every 24 hours
    setTimeout(() => {
        runDailyDigest();
        setInterval(runDailyDigest, 24 * 60 * 60 * 1000);
    }, 5000);

    logger.info('Cron triggers initialized: stale deals (6h), overdue tasks (1h), daily digest (24h)');
};

module.exports = {
    checkStaleDealTriggers,
    checkOverdueTaskTriggers,
    runDailyDigest,
    initCronTriggers,
};
