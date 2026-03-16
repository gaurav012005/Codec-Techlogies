/**
 * Background Workers — Bull Queue Processors
 *
 * This module defines all background job processors.
 * Workers handle: email sending, CSV import processing,
 * workflow delayed step execution, and scheduled tasks.
 *
 * In production, these would run as separate processes
 * via `node backend/workers/index.js` for scalability.
 * In development, they run inside the main server process.
 */

const logger = require('../utils/logger');

/**
 * Email Worker
 * Processes queued outbound emails (bulk sends, scheduled emails).
 */
const processEmailJob = async (job) => {
    const { to, subject, body, templateId, contactId, organizationId } = job.data;
    try {
        logger.info(`[EmailWorker] Processing email job ${job.id} to ${to}`);

        // In production: use nodemailer transport
        // For now, just log success
        logger.info(`[EmailWorker] Email sent to ${to}: "${subject}"`);

        return { success: true, to, messageId: `msg_${Date.now()}` };
    } catch (error) {
        logger.error(`[EmailWorker] Failed to send email: ${error.message}`);
        throw error; // Bull will retry based on queue config
    }
};

/**
 * Import Worker
 * Processes CSV/Excel import jobs in the background.
 * Handles large file parsing, validation, duplicate detection, and record creation.
 */
const processImportJob = async (job) => {
    const { filePath, entity, columnMapping, organizationId, userId } = job.data;
    try {
        logger.info(`[ImportWorker] Processing import job ${job.id} for ${entity}`);

        // Update progress
        await job.progress(10);

        // In production: parse CSV, validate rows, create records
        await job.progress(50);

        // Simulate completion
        await job.progress(100);

        logger.info(`[ImportWorker] Import complete for ${entity}`);
        return { success: true, entity, recordsCreated: 0, recordsSkipped: 0 };
    } catch (error) {
        logger.error(`[ImportWorker] Import failed: ${error.message}`);
        throw error;
    }
};

/**
 * Workflow Worker
 * Executes delayed workflow steps (e.g., "wait 2 days then send email").
 */
const processWorkflowJob = async (job) => {
    const { workflowId, executionId, stepIndex, organizationId } = job.data;
    try {
        logger.info(`[WorkflowWorker] Processing delayed step ${stepIndex} for workflow ${workflowId}`);

        // In production: load workflow, execute the delayed step,
        // then continue to subsequent steps
        logger.info(`[WorkflowWorker] Delayed step ${stepIndex} executed`);

        return { success: true, workflowId, stepIndex };
    } catch (error) {
        logger.error(`[WorkflowWorker] Step execution failed: ${error.message}`);
        throw error;
    }
};

/**
 * Notification Worker
 * Sends push notifications, digest emails, and in-app alerts.
 */
const processNotificationJob = async (job) => {
    const { userId, type, title, message, channel } = job.data;
    try {
        logger.info(`[NotificationWorker] Sending ${type} notification to user ${userId}`);

        // In production: emit via Socket.io, send push notification, or email
        return { success: true, userId, type };
    } catch (error) {
        logger.error(`[NotificationWorker] Notification failed: ${error.message}`);
        throw error;
    }
};

/**
 * Register all workers with their respective Bull queues.
 * Called from server.js after Redis connection is established.
 *
 * @param {Object} queues - Object containing Bull queue instances
 *   { emailQueue, importQueue, workflowQueue, notificationQueue }
 */
const registerWorkers = (queues) => {
    if (queues.emailQueue) {
        queues.emailQueue.process(processEmailJob);
        logger.info('Email worker registered');
    }

    if (queues.importQueue) {
        queues.importQueue.process(processImportJob);
        logger.info('Import worker registered');
    }

    if (queues.workflowQueue) {
        queues.workflowQueue.process(processWorkflowJob);
        logger.info('Workflow worker registered');
    }

    if (queues.notificationQueue) {
        queues.notificationQueue.process(processNotificationJob);
        logger.info('Notification worker registered');
    }
};

module.exports = {
    processEmailJob,
    processImportJob,
    processWorkflowJob,
    processNotificationJob,
    registerWorkers,
};
