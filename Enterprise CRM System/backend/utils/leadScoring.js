const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');
const logger = require('./logger');

/**
 * Lead Scoring Engine — Rule-based scoring system
 * 
 * Scores are accumulated from activities and profile attributes.
 * Configurable rules with positive/negative scoring.
 */

const DEFAULT_SCORING_RULES = {
    // Activity-based scores
    email_opened: { points: 5, label: 'Email opened' },
    email_replied: { points: 15, label: 'Email replied' },
    email_clicked: { points: 8, label: 'Email link clicked' },
    meeting_scheduled: { points: 20, label: 'Meeting scheduled' },
    call_completed: { points: 10, label: 'Call completed' },
    demo_completed: { points: 25, label: 'Demo completed' },
    proposal_sent: { points: 15, label: 'Proposal sent' },
    content_downloaded: { points: 12, label: 'Content downloaded' },
    pricing_page: { points: 8, label: 'Visited pricing page' },

    // Profile-based scores
    title_director_plus: { points: 10, label: 'Director+ title' },
    company_size_large: { points: 10, label: 'Company 100+ employees' },
    budget_confirmed: { points: 25, label: 'Budget confirmed' },

    // Negative scores
    no_activity_14d: { points: -10, label: 'No activity in 14 days' },
    email_bounced: { points: -15, label: 'Email bounced' },
    unsubscribed: { points: -20, label: 'Unsubscribed' },
    lost_deal: { points: -10, label: 'Associated deal lost' },
};

/**
 * Calculate lead score based on activities and profile
 */
const calculateLeadScore = async (leadId, organizationId) => {
    try {
        const lead = await Lead.findOne({ _id: leadId, organizationId });
        if (!lead) return null;

        let score = 0;
        const breakdown = [];

        // Activity-based scoring
        const activities = await Activity.find({
            relatedTo: leadId,
            relatedModel: 'Lead',
        }).sort({ createdAt: -1 });

        const activityCounts = {};
        activities.forEach(a => {
            activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
        });

        // Score by activity type
        if (activityCounts.email > 0) {
            const pts = activityCounts.email * 5;
            score += pts;
            breakdown.push({ rule: 'email_opened', points: pts, count: activityCounts.email });
        }
        if (activityCounts.meeting > 0) {
            const pts = activityCounts.meeting * 20;
            score += pts;
            breakdown.push({ rule: 'meeting_scheduled', points: pts, count: activityCounts.meeting });
        }
        if (activityCounts.call > 0) {
            const pts = activityCounts.call * 10;
            score += pts;
            breakdown.push({ rule: 'call_completed', points: pts, count: activityCounts.call });
        }
        if (activityCounts.note > 0) {
            const pts = activityCounts.note * 3;
            score += pts;
            breakdown.push({ rule: 'note_added', points: pts, count: activityCounts.note });
        }

        // Profile-based scoring
        const seniorTitles = ['director', 'vp', 'vice president', 'ceo', 'cto', 'cfo', 'coo', 'chief', 'head', 'president', 'svp', 'evp'];
        if (lead.customFields?.title) {
            const title = lead.customFields.title.toLowerCase();
            if (seniorTitles.some(t => title.includes(t))) {
                score += 10;
                breakdown.push({ rule: 'title_director_plus', points: 10 });
            }
        }

        // Company info scoring
        if (lead.company && lead.company.length > 0) {
            score += 5;
            breakdown.push({ rule: 'has_company', points: 5 });
        }

        if (lead.email && lead.email.length > 0) {
            score += 5;
            breakdown.push({ rule: 'has_email', points: 5 });
        }

        if (lead.phone && lead.phone.length > 0) {
            score += 3;
            breakdown.push({ rule: 'has_phone', points: 3 });
        }

        // Source-based scoring
        const sourceScores = {
            referral: 15,
            website: 10,
            linkedin: 8,
            event: 12,
            email: 5,
            cold_call: 3,
            advertisement: 7,
            other: 2,
        };
        if (lead.source && sourceScores[lead.source]) {
            const pts = sourceScores[lead.source];
            score += pts;
            breakdown.push({ rule: `source_${lead.source}`, points: pts });
        }

        // Recency penalty
        if (activities.length > 0) {
            const lastActivity = activities[0];
            const daysSince = (Date.now() - new Date(lastActivity.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysSince > 14) {
                score -= 10;
                breakdown.push({ rule: 'no_activity_14d', points: -10 });
            }
        } else {
            // No activities at all
            score -= 5;
            breakdown.push({ rule: 'no_activities', points: -5 });
        }

        // Status-based scoring
        if (lead.status === 'qualified') {
            score += 15;
            breakdown.push({ rule: 'qualified_status', points: 15 });
        } else if (lead.status === 'contacted') {
            score += 5;
            breakdown.push({ rule: 'contacted_status', points: 5 });
        } else if (lead.status === 'unqualified') {
            score -= 15;
            breakdown.push({ rule: 'unqualified_status', points: -15 });
        }

        // Clamp score to 0-100
        score = Math.max(0, Math.min(100, score));

        // Classification
        let classification;
        if (score >= 80) classification = { label: 'Hot', color: '#22c55e', level: 'hot' };
        else if (score >= 40) classification = { label: 'Warm', color: '#f59e0b', level: 'warm' };
        else classification = { label: 'Cold', color: '#ef4444', level: 'cold' };

        // Update lead score in DB
        await Lead.findByIdAndUpdate(leadId, { leadScore: score });

        return {
            score,
            classification,
            breakdown,
            totalActivities: activities.length,
            calculatedAt: new Date(),
        };
    } catch (error) {
        logger.error(`Lead scoring failed for ${leadId}: ${error.message}`);
        return null;
    }
};

/**
 * Batch recalculate scores for all leads in an organization
 */
const recalculateAllScores = async (organizationId) => {
    try {
        const leads = await Lead.find({ organizationId }).select('_id');
        const results = await Promise.all(
            leads.map(l => calculateLeadScore(l._id, organizationId))
        );
        const updated = results.filter(Boolean).length;
        logger.info(`Recalculated scores for ${updated}/${leads.length} leads in org ${organizationId}`);
        return updated;
    } catch (error) {
        logger.error(`Batch scoring failed: ${error.message}`);
        return 0;
    }
};

module.exports = {
    calculateLeadScore,
    recalculateAllScores,
    DEFAULT_SCORING_RULES,
};
