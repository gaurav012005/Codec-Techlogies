// ============================================
// Risk Score Engine — Feature 9
// Calculates weighted risk score after submit
// ============================================

const prisma = require('../config/db');

const WEIGHTS = {
    TAB_SWITCH: 15,
    FULLSCREEN_EXIT: 10,
    COPY_PASTE_ATTEMPT: 5,
    SCREENSHOT_ATTEMPT: 3,
    FACE_NOT_DETECTED: 20,
    MULTIPLE_FACES: 25,
};

const RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: Infinity,
};

/**
 * Calculate and persist risk score for a given attempt
 * Called automatically after exam submission
 */
async function calculateRiskScore(attemptId) {
    try {
        const logs = await prisma.proctorLog.findMany({
            where: { attemptId },
        });

        if (logs.length === 0) {
            return await prisma.riskScore.upsert({
                where: { attemptId },
                create: {
                    attemptId,
                    tabSwitchScore: 0,
                    faceMissingScore: 0,
                    multiFaceScore: 0,
                    totalRiskScore: 0,
                    riskLevel: 'LOW',
                },
                update: {
                    totalRiskScore: 0,
                    riskLevel: 'LOW',
                },
            });
        }

        // Group by type
        const counts = {};
        for (const log of logs) {
            counts[log.eventType] = (counts[log.eventType] || 0) + 1;
        }

        // Calculate weighted scores (diminishing returns — log scale)
        const tabSwitchScore = Math.min(
            (counts.TAB_SWITCH || 0) * WEIGHTS.TAB_SWITCH,
            50
        );
        const faceMissingScore = Math.min(
            (counts.FACE_NOT_DETECTED || 0) * WEIGHTS.FACE_NOT_DETECTED,
            60
        );
        const multiFaceScore = Math.min(
            (counts.MULTIPLE_FACES || 0) * WEIGHTS.MULTIPLE_FACES,
            50
        );
        const copyPasteScore = Math.min(
            (counts.COPY_PASTE_ATTEMPT || 0) * WEIGHTS.COPY_PASTE_ATTEMPT,
            20
        );
        const fullscreenScore = Math.min(
            (counts.FULLSCREEN_EXIT || 0) * WEIGHTS.FULLSCREEN_EXIT,
            30
        );

        const totalRiskScore = Math.min(
            tabSwitchScore + faceMissingScore + multiFaceScore + copyPasteScore + fullscreenScore,
            100
        );

        const riskLevel =
            totalRiskScore < RISK_THRESHOLDS.LOW ? 'LOW'
                : totalRiskScore < RISK_THRESHOLDS.MEDIUM ? 'MEDIUM'
                    : 'HIGH';

        const riskScore = await prisma.riskScore.upsert({
            where: { attemptId },
            create: {
                attemptId,
                tabSwitchScore,
                faceMissingScore,
                multiFaceScore,
                totalRiskScore,
                riskLevel,
            },
            update: {
                tabSwitchScore,
                faceMissingScore,
                multiFaceScore,
                totalRiskScore,
                riskLevel,
                calculatedAt: new Date(),
            },
        });

        return riskScore;
    } catch (err) {
        console.error('[RiskScore] Calculation error:', err.message);
        return null;
    }
}

module.exports = { calculateRiskScore, WEIGHTS, RISK_THRESHOLDS };
