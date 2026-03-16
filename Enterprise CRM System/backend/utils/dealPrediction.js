const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * AI Deal Win Prediction Engine
 * 
 * Statistical model that predicts the probability of winning a deal
 * using 7 weighted factors inspired by logistic regression scoring.
 * 
 * Factor Weights:
 * 1. Historical win rate for similar deal size  — 25%
 * 2. Sales cycle length vs current deal age     — 20%
 * 3. Number of activities on deal               — 15%
 * 4. Lead score of associated contact           — 15%
 * 5. Stage progression speed                    — 10%
 * 6. Competitor presence                        — 10%
 * 7. Last activity recency                      — 5%
 */

// Sigmoid function for smooth probability mapping
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// Normalize a value to 0-1 range
const normalize = (value, min, max) => {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Calculate win prediction for a single deal
 * @param {Object} deal — The deal document
 * @param {String} organizationId — Organization scope
 * @returns {Object} — { probability, confidence, factors, recommendations }
 */
const predictDealWin = async (deal, organizationId) => {
    try {
        const factors = {};
        let weightedScore = 0;

        // ──────────────────────────────────────────
        // Factor 1: Historical win rate for similar deal size (25%)
        // ──────────────────────────────────────────
        const dealValue = deal.value || 0;
        const valueRange = {
            min: dealValue * 0.5,
            max: dealValue * 1.5,
        };

        const similarDeals = await Deal.find({
            organizationId,
            value: { $gte: valueRange.min, $lte: valueRange.max },
            status: { $in: ['won', 'lost'] },
        }).select('status');

        let historicalWinRate = 0.5; // default 50%
        if (similarDeals.length >= 3) {
            const won = similarDeals.filter(d => d.status === 'won').length;
            historicalWinRate = won / similarDeals.length;
        }
        factors.historicalWinRate = {
            weight: 0.25,
            score: historicalWinRate,
            detail: `${Math.round(historicalWinRate * 100)}% win rate for similar deals ($${Math.round(valueRange.min)}-$${Math.round(valueRange.max)})`,
            sampleSize: similarDeals.length,
        };
        weightedScore += historicalWinRate * 0.25;

        // ──────────────────────────────────────────
        // Factor 2: Sales cycle length vs current deal age (20%)
        // ──────────────────────────────────────────
        const avgCycleResult = await Deal.aggregate([
            {
                $match: {
                    organizationId: require('mongoose').Types.ObjectId.createFromHexString(organizationId),
                    status: 'won',
                    actualCloseDate: { $exists: true },
                },
            },
            {
                $project: {
                    cycleDays: {
                        $divide: [
                            { $subtract: ['$actualCloseDate', '$createdAt'] },
                            1000 * 60 * 60 * 24,
                        ],
                    },
                },
            },
            { $group: { _id: null, avgCycle: { $avg: '$cycleDays' } } },
        ]);

        const avgSalesCycle = avgCycleResult[0]?.avgCycle || 30;
        const dealAge = (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const cycleRatio = dealAge / avgSalesCycle;

        // Deals within normal cycle get higher scores, very old deals get lower
        let cycleScore = 0.5;
        if (cycleRatio < 0.5) cycleScore = 0.7; // Early in cycle — good
        else if (cycleRatio < 1.0) cycleScore = 0.8; // Normal pace — great
        else if (cycleRatio < 1.5) cycleScore = 0.5; // Slightly over — neutral
        else if (cycleRatio < 2.0) cycleScore = 0.3; // Over cycle — concerning
        else cycleScore = 0.15; // Way over — risky

        factors.salesCycle = {
            weight: 0.20,
            score: cycleScore,
            detail: `Deal age: ${Math.round(dealAge)}d vs avg cycle: ${Math.round(avgSalesCycle)}d (${Math.round(cycleRatio * 100)}%)`,
        };
        weightedScore += cycleScore * 0.20;

        // ──────────────────────────────────────────
        // Factor 3: Number of activities on deal (15%)
        // ──────────────────────────────────────────
        const activityCount = await Activity.countDocuments({
            relatedTo: deal._id,
            relatedModel: 'Deal',
        });

        // Benchmark: avg activities on won deals
        const avgActivitiesResult = await Activity.aggregate([
            {
                $match: {
                    organizationId: require('mongoose').Types.ObjectId.createFromHexString(organizationId),
                    relatedModel: 'Deal',
                },
            },
            { $group: { _id: '$relatedTo', count: { $sum: 1 } } },
            { $group: { _id: null, avgCount: { $avg: '$count' } } },
        ]);

        const avgActivities = avgActivitiesResult[0]?.avgCount || 5;
        const activityScore = normalize(activityCount, 0, avgActivities * 2);

        factors.activityCount = {
            weight: 0.15,
            score: Math.min(activityScore, 1),
            detail: `${activityCount} activities (avg: ${Math.round(avgActivities)})`,
        };
        weightedScore += Math.min(activityScore, 1) * 0.15;

        // ──────────────────────────────────────────
        // Factor 4: Lead score of associated contact (15%)
        // ──────────────────────────────────────────
        let contactScore = 0.5;
        if (deal.contactId) {
            const contact = await Contact.findById(deal.contactId).select('leadScore');
            if (contact && contact.leadScore > 0) {
                contactScore = contact.leadScore / 100;
            }
        }
        factors.contactScore = {
            weight: 0.15,
            score: contactScore,
            detail: `Contact lead score: ${Math.round(contactScore * 100)}`,
        };
        weightedScore += contactScore * 0.15;

        // ──────────────────────────────────────────
        // Factor 5: Stage progression speed (10%)
        // ──────────────────────────────────────────
        let progressionScore = 0.5;
        if (deal.stageHistory && deal.stageHistory.length > 1) {
            const stagesTraversed = deal.stageHistory.length;
            const progressionRate = stagesTraversed / Math.max(dealAge, 1) * 7; // stages per week
            progressionScore = normalize(progressionRate, 0, 2); // 2 stages/week = perfect
        }
        factors.progressionSpeed = {
            weight: 0.10,
            score: progressionScore,
            detail: `${deal.stageHistory?.length || 1} stage(s) traversed in ${Math.round(dealAge)} days`,
        };
        weightedScore += progressionScore * 0.10;

        // ──────────────────────────────────────────
        // Factor 6: Competitor presence (10%)
        // ──────────────────────────────────────────
        const hasCompetitor = deal.competitorInfo && deal.competitorInfo.trim().length > 0;
        const competitorScore = hasCompetitor ? 0.35 : 0.7;
        factors.competitorPresence = {
            weight: 0.10,
            score: competitorScore,
            detail: hasCompetitor ? `Competitor noted: "${deal.competitorInfo}"` : 'No competitor detected',
        };
        weightedScore += competitorScore * 0.10;

        // ──────────────────────────────────────────
        // Factor 7: Last activity recency (5%)
        // ──────────────────────────────────────────
        const lastActivity = await Activity.findOne({
            relatedTo: deal._id,
            relatedModel: 'Deal',
        }).sort({ createdAt: -1 });

        let recencyScore = 0.3;
        if (lastActivity) {
            const daysSinceActivity = (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActivity < 1) recencyScore = 1.0;
            else if (daysSinceActivity < 3) recencyScore = 0.8;
            else if (daysSinceActivity < 7) recencyScore = 0.6;
            else if (daysSinceActivity < 14) recencyScore = 0.4;
            else if (daysSinceActivity < 30) recencyScore = 0.2;
            else recencyScore = 0.1;
        }
        factors.lastActivityRecency = {
            weight: 0.05,
            score: recencyScore,
            detail: lastActivity
                ? `Last activity: ${Math.round((Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                : 'No activities recorded',
        };
        weightedScore += recencyScore * 0.05;

        // ──────────────────────────────────────────
        // Final Probability Calculation
        // ──────────────────────────────────────────
        // Apply sigmoid to smooth the score and convert to 0-100%
        const rawProbability = weightedScore;
        const smoothedProbability = sigmoid((rawProbability - 0.5) * 6); // Steeper sigmoid
        const finalProbability = Math.round(smoothedProbability * 100);

        // Confidence level based on data quality
        let confidence = 'medium';
        if (similarDeals.length >= 10 && activityCount >= 3) confidence = 'high';
        else if (similarDeals.length < 3 && activityCount < 2) confidence = 'low';

        // Recommendations
        const recommendations = [];
        if (activityScore < 0.4) recommendations.push('Add more activities to improve engagement');
        if (recencyScore < 0.5) recommendations.push('Follow up soon — no recent activity');
        if (contactScore < 0.4) recommendations.push('Improve contact qualification');
        if (hasCompetitor) recommendations.push('Address competitor concerns proactively');
        if (cycleRatio > 1.5) recommendations.push('Deal is past typical cycle — consider escalation');
        if (progressionScore < 0.4) recommendations.push('Move deal forward through pipeline stages');

        return {
            probability: finalProbability,
            confidence,
            rawScore: Math.round(rawProbability * 100),
            factors,
            recommendations,
            calculatedAt: new Date(),
        };
    } catch (error) {
        logger.error(`Deal prediction failed for ${deal._id}: ${error.message}`);
        return {
            probability: deal.probability || 50,
            confidence: 'low',
            rawScore: 50,
            factors: {},
            recommendations: ['Prediction calculation failed — using default probability'],
            calculatedAt: new Date(),
            error: error.message,
        };
    }
};

/**
 * Get classification label based on probability
 */
const getClassification = (probability) => {
    if (probability >= 70) return { label: 'High', color: '#22c55e', level: 'hot' };
    if (probability >= 40) return { label: 'Medium', color: '#f59e0b', level: 'warm' };
    return { label: 'Low', color: '#ef4444', level: 'cold' };
};

module.exports = {
    predictDealWin,
    getClassification,
};
