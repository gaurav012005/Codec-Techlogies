// ============================================
// Proctor Controller — Feature 8 & 9
// Webcam & Event Logging
// ============================================

const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ─── POST /api/proctor/log ────────────────────────────────────────────────────
// Ingest a single proctor event from the frontend
const logEvent = async (req, res, next) => {
    try {
        const { attemptId, eventType, riskLevel, details } = req.body;

        if (!attemptId || !eventType) {
            throw new AppError('attemptId and eventType are required', 400);
        }

        // Valid enums
        const validEvents = [
            'TAB_SWITCH', 'FACE_NOT_DETECTED', 'MULTIPLE_FACES',
            'FULLSCREEN_EXIT', 'SCREENSHOT_ATTEMPT', 'COPY_PASTE_ATTEMPT',
        ];
        const validRisk = ['LOW', 'MEDIUM', 'HIGH'];

        if (!validEvents.includes(eventType)) {
            throw new AppError(`Invalid eventType. Valid values: ${validEvents.join(', ')}`, 400);
        }

        const resolvedRisk = validRisk.includes(riskLevel) ? riskLevel : 'MEDIUM';

        // Verify attempt belongs to student
        const attempt = await prisma.examAttempt.findFirst({
            where: { id: attemptId, studentId: req.user.id, status: 'IN_PROGRESS' },
        });

        if (!attempt) {
            throw new AppError('Active attempt not found', 404);
        }

        const log = await prisma.proctorLog.create({
            data: {
                attemptId,
                eventType,
                riskLevel: resolvedRisk,
                details: details || {},
            },
        });

        res.status(201).json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/proctor/log/batch ──────────────────────────────────────────────
// Bulk ingest multiple events (sent on exam submit or page unload)
const logBatchEvents = async (req, res, next) => {
    try {
        const { events } = req.body; // array of { attemptId, eventType, riskLevel, details }

        if (!Array.isArray(events) || events.length === 0) {
            throw new AppError('events array is required', 400);
        }

        const created = await prisma.proctorLog.createMany({
            data: events.map((e) => ({
                attemptId: e.attemptId,
                eventType: e.eventType,
                riskLevel: e.riskLevel || 'MEDIUM',
                details: e.details || {},
            })),
            skipDuplicates: true,
        });

        res.status(201).json({ success: true, count: created.count });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/proctor/attempt/:attemptId ─────────────────────────────────────
// Admin/Examiner: get all proctor logs for an attempt
const getAttemptLogs = async (req, res, next) => {
    try {
        const { attemptId } = req.params;

        const logs = await prisma.proctorLog.findMany({
            where: { attemptId },
            orderBy: { eventTime: 'asc' },
        });

        // Summarize by event type
        const summary = {};
        for (const log of logs) {
            if (!summary[log.eventType]) summary[log.eventType] = 0;
            summary[log.eventType]++;
        }

        res.json({ success: true, data: { logs, summary, totalEvents: logs.length } });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/proctor/exam/:examId ────────────────────────────────────────────
// Admin/Examiner: get proctor summary across all attempts for an exam
const getExamProctorSummary = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const attempts = await prisma.examAttempt.findMany({
            where: { examId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
            include: {
                student: { select: { id: true, name: true, email: true } },
                proctorLogs: true,
                riskScore: true,
            },
        });

        const summary = attempts.map((attempt) => {
            const byType = {};
            for (const log of attempt.proctorLogs) {
                if (!byType[log.eventType]) byType[log.eventType] = 0;
                byType[log.eventType]++;
            }

            return {
                attemptId: attempt.id,
                student: attempt.student,
                totalEvents: attempt.proctorLogs.length,
                byType,
                riskScore: attempt.riskScore,
                flagged: attempt.proctorLogs.length > 5 || attempt.riskScore?.totalRiskScore > 60,
            };
        });

        // Sort by most flagged
        summary.sort((a, b) => b.totalEvents - a.totalEvents);

        res.json({ success: true, data: summary });
    } catch (err) {
        next(err);
    }
};

module.exports = { logEvent, logBatchEvents, getAttemptLogs, getExamProctorSummary };
