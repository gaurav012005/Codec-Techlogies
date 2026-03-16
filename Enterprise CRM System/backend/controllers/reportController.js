const Deal = require('../models/Deal');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const User = require('../models/User');
const Pipeline = require('../models/Pipeline');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

// Helper: Build date filter
const buildDateFilter = (startDate, endDate) => {
    const filter = {};
    if (startDate) filter.$gte = new Date(startDate);
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.$lte = end;
    }
    return Object.keys(filter).length ? filter : null;
};

// Helper: Try Redis cache
const getCached = async (key) => {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch { return null; }
};

const setCache = async (key, data, ttl = 300) => {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch (err) {
        logger.warn(`Redis cache set failed for ${key}`);
    }
};

// Helper: Invalidate report cache for an organization
const invalidateReportCache = async (organizationId) => {
    const redis = getRedis();
    if (!redis) return;
    try {
        const keys = await redis.keys(`report:${organizationId}:*`);
        if (keys.length > 0) await redis.del(...keys);
    } catch (err) {
        logger.warn('Report cache invalidation failed');
    }
};

// ─────────────────────────────────────────────
// GET /api/reports/dashboard — KPI Summary
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { startDate, endDate, ownerId, pipelineId } = req.query;

        const cacheKey = `report:${organizationId}:dashboard:${startDate || ''}:${endDate || ''}:${ownerId || ''}:${pipelineId || ''}`;
        const cached = await getCached(cacheKey);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const dateFilter = buildDateFilter(startDate, endDate);
        const baseFilter = { organizationId };
        if (ownerId) baseFilter.ownerId = ownerId;

        // Lead stats
        const leadFilter = { ...baseFilter };
        if (dateFilter) leadFilter.createdAt = dateFilter;
        const totalLeads = await Lead.countDocuments(leadFilter);
        const convertedLeads = await Lead.countDocuments({ ...leadFilter, status: 'converted' });

        // Deal stats
        const dealFilter = { ...baseFilter };
        if (pipelineId) dealFilter.pipelineId = pipelineId;
        if (dateFilter) dealFilter.createdAt = dateFilter;

        const totalDeals = await Deal.countDocuments(dealFilter);
        const wonDeals = await Deal.find({ ...dealFilter, status: 'won' });
        const lostDeals = await Deal.countDocuments({ ...dealFilter, status: 'lost' });
        const openDeals = await Deal.countDocuments({ ...dealFilter, status: 'open' });

        const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
        const wonCount = wonDeals.length;
        const avgDealSize = wonCount > 0 ? Math.round(totalRevenue / wonCount) : 0;
        const winRate = (wonCount + lostDeals) > 0
            ? Math.round((wonCount / (wonCount + lostDeals)) * 100)
            : 0;
        const conversionRate = totalLeads > 0
            ? Math.round((convertedLeads / totalLeads) * 100)
            : 0;

        // Sales cycle length (avg days from creation to close for won deals)
        let avgSalesCycle = 0;
        if (wonDeals.length > 0) {
            const totalDays = wonDeals.reduce((sum, d) => {
                const close = d.actualCloseDate || d.updatedAt;
                const diff = (new Date(close) - new Date(d.createdAt)) / (1000 * 60 * 60 * 24);
                return sum + diff;
            }, 0);
            avgSalesCycle = Math.round(totalDays / wonDeals.length);
        }

        // Activity count
        const activityFilter = { organizationId };
        if (dateFilter) activityFilter.createdAt = dateFilter;
        const totalActivities = await Activity.countDocuments(activityFilter);

        // Task stats
        const taskFilter = { organizationId };
        if (dateFilter) taskFilter.createdAt = dateFilter;
        const pendingTasks = await Task.countDocuments({ ...taskFilter, status: { $ne: 'completed' } });

        // Revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const revenueTrend = await Deal.aggregate([
            {
                $match: {
                    organizationId: require('mongoose').Types.ObjectId.createFromHexString(organizationId),
                    status: 'won',
                    actualCloseDate: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$actualCloseDate' },
                        month: { $month: '$actualCloseDate' },
                    },
                    revenue: { $sum: '$value' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = revenueTrend.map(r => ({
            month: monthNames[r._id.month - 1],
            year: r._id.year,
            revenue: r.revenue,
            deals: r.count,
        }));

        const data = {
            totalLeads,
            convertedLeads,
            totalDeals,
            openDeals,
            wonCount,
            lostDeals,
            totalRevenue,
            avgDealSize,
            winRate,
            conversionRate,
            avgSalesCycle,
            totalActivities,
            pendingTasks,
            revenueByMonth,
        };

        await setCache(cacheKey, data);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/reports/pipeline — Pipeline Analytics
// ─────────────────────────────────────────────
exports.getPipelineReport = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { pipelineId, startDate, endDate } = req.query;

        const cacheKey = `report:${organizationId}:pipeline:${pipelineId || ''}:${startDate || ''}:${endDate || ''}`;
        const cached = await getCached(cacheKey);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        // Get pipeline (first pipeline if not specified)
        let pipeline;
        if (pipelineId) {
            pipeline = await Pipeline.findOne({ _id: pipelineId, organizationId });
        } else {
            pipeline = await Pipeline.findOne({ organizationId, isDefault: true }) ||
                await Pipeline.findOne({ organizationId });
        }
        if (!pipeline) {
            return res.json({ success: true, data: { stages: [], stageDistribution: [], dropOff: [] } });
        }

        const dealFilter = { organizationId, pipelineId: pipeline._id };
        const dateFilter = buildDateFilter(startDate, endDate);
        if (dateFilter) dealFilter.createdAt = dateFilter;

        // Stage distribution (open deals per stage)
        const stageDistribution = await Deal.aggregate([
            { $match: { ...dealFilter, status: 'open' } },
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$value' },
                    avgProbability: { $avg: '$probability' },
                },
            },
        ]);

        // Map to pipeline stage order
        const orderedStages = pipeline.stages.map(s => {
            const stageData = stageDistribution.find(sd => sd._id === s.name) || {};
            return {
                name: s.name,
                order: s.order,
                color: s.color,
                count: stageData.count || 0,
                totalValue: stageData.totalValue || 0,
                avgProbability: Math.round(stageData.avgProbability || s.probability),
            };
        });

        // Drop-off analysis — percentage of deals that moved from one stage to the next
        const allDeals = await Deal.find({ organizationId, pipelineId: pipeline._id }).select('stageHistory stage status');
        const dropOff = [];
        for (let i = 0; i < pipeline.stages.length - 1; i++) {
            const current = pipeline.stages[i].name;
            const next = pipeline.stages[i + 1].name;
            const reachedCurrent = allDeals.filter(d =>
                d.stageHistory && d.stageHistory.some(h => h.stage === current)
            ).length;
            const reachedNext = allDeals.filter(d =>
                d.stageHistory && d.stageHistory.some(h => h.stage === next)
            ).length;
            const rate = reachedCurrent > 0 ? Math.round((reachedNext / reachedCurrent) * 100) : 0;
            dropOff.push({
                from: current,
                to: next,
                fromCount: reachedCurrent,
                toCount: reachedNext,
                conversionRate: rate,
                dropOffRate: 100 - rate,
            });
        }

        // Avg time per stage (from stageHistory)
        const avgTimePerStage = pipeline.stages.map(s => {
            let totalTime = 0;
            let count = 0;
            allDeals.forEach(d => {
                if (!d.stageHistory) return;
                const stageEntry = d.stageHistory.find(h => h.stage === s.name);
                if (stageEntry && stageEntry.exitedAt) {
                    const days = (new Date(stageEntry.exitedAt) - new Date(stageEntry.enteredAt)) / (1000 * 60 * 60 * 24);
                    totalTime += days;
                    count++;
                }
            });
            return {
                stage: s.name,
                avgDays: count > 0 ? Math.round(totalTime / count * 10) / 10 : 0,
                color: s.color,
            };
        });

        const data = {
            pipeline: { id: pipeline._id, name: pipeline.name },
            stages: orderedStages,
            dropOff,
            avgTimePerStage,
        };

        await setCache(cacheKey, data);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/reports/forecast — Revenue Forecast
// ─────────────────────────────────────────────
exports.getForecastReport = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { pipelineId } = req.query;

        const cacheKey = `report:${organizationId}:forecast:${pipelineId || ''}`;
        const cached = await getCached(cacheKey);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const filter = { organizationId, status: 'open' };
        if (pipelineId) filter.pipelineId = pipelineId;

        const openDeals = await Deal.find(filter).populate('ownerId', 'name');

        const totalPipeline = openDeals.reduce((sum, d) => sum + d.value, 0);
        const weightedForecast = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
        const bestCase = openDeals.reduce((sum, d) => sum + (d.probability >= 25 ? d.value : 0), 0);
        const worstCase = openDeals.reduce((sum, d) => sum + (d.probability >= 75 ? d.value : 0), 0);

        // Won deals for actual
        const wonFilter = { organizationId, status: 'won' };
        if (pipelineId) wonFilter.pipelineId = pipelineId;
        const wonDeals = await Deal.find(wonFilter);
        const totalWon = wonDeals.reduce((sum, d) => sum + d.value, 0);

        // Monthly forecast breakdown (by expected close date)
        const monthlyForecast = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        openDeals.forEach(d => {
            if (d.expectedCloseDate) {
                const date = new Date(d.expectedCloseDate);
                const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                if (!monthlyForecast[key]) {
                    monthlyForecast[key] = { month: key, pipeline: 0, weighted: 0, count: 0 };
                }
                monthlyForecast[key].pipeline += d.value;
                monthlyForecast[key].weighted += d.value * d.probability / 100;
                monthlyForecast[key].count++;
            }
        });

        // Monthly actual (won deals by close date)
        const monthlyActual = {};
        wonDeals.forEach(d => {
            const date = new Date(d.actualCloseDate || d.updatedAt);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (!monthlyActual[key]) {
                monthlyActual[key] = { month: key, actual: 0, count: 0 };
            }
            monthlyActual[key].actual += d.value;
            monthlyActual[key].count++;
        });

        // Merge forecast & actual into combined array
        const allMonths = new Set([...Object.keys(monthlyForecast), ...Object.keys(monthlyActual)]);
        const monthlyBreakdown = Array.from(allMonths).map(key => ({
            month: key,
            pipeline: monthlyForecast[key]?.pipeline || 0,
            weighted: Math.round(monthlyForecast[key]?.weighted || 0),
            actual: monthlyActual[key]?.actual || 0,
            forecastDeals: monthlyForecast[key]?.count || 0,
            wonDeals: monthlyActual[key]?.count || 0,
        }));

        // Top deals at risk (low probability, high value)
        const atRiskDeals = openDeals
            .filter(d => d.probability < 40 && d.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map(d => ({
                id: d._id,
                title: d.title,
                value: d.value,
                probability: d.probability,
                stage: d.stage,
                owner: d.ownerId?.name || 'Unassigned',
            }));

        const data = {
            totalPipeline: Math.round(totalPipeline),
            weightedForecast: Math.round(weightedForecast),
            bestCase: Math.round(bestCase),
            worstCase: Math.round(worstCase),
            totalWon: Math.round(totalWon),
            openDealCount: openDeals.length,
            wonDealCount: wonDeals.length,
            monthlyBreakdown,
            atRiskDeals,
        };

        await setCache(cacheKey, data);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/reports/team — Team Performance
// ─────────────────────────────────────────────
exports.getTeamReport = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { startDate, endDate } = req.query;

        const cacheKey = `report:${organizationId}:team:${startDate || ''}:${endDate || ''}`;
        const cached = await getCached(cacheKey);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const dateFilter = buildDateFilter(startDate, endDate);

        // Get all users in org
        const users = await User.find({ organizationId, isActive: true }).select('name email role avatar department');

        const leaderboard = await Promise.all(users.map(async (user) => {
            // Won deals
            const wonFilter = { organizationId, ownerId: user._id, status: 'won' };
            if (dateFilter) wonFilter.actualCloseDate = dateFilter;
            const wonDeals = await Deal.find(wonFilter);
            const revenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

            // Total deals
            const dealFilter = { organizationId, ownerId: user._id };
            if (dateFilter) dealFilter.createdAt = dateFilter;
            const totalDeals = await Deal.countDocuments(dealFilter);

            // Lost deals
            const lostFilter = { organizationId, ownerId: user._id, status: 'lost' };
            if (dateFilter) lostFilter.actualCloseDate = dateFilter;
            const lostCount = await Deal.countDocuments(lostFilter);

            // Activities
            const actFilter = { organizationId, userId: user._id };
            if (dateFilter) actFilter.createdAt = dateFilter;
            const activityCount = await Activity.countDocuments(actFilter);

            // Tasks completed
            const taskFilter = { organizationId, assignedTo: user._id, status: 'completed' };
            if (dateFilter) taskFilter.completedAt = dateFilter;
            const tasksCompleted = await Task.countDocuments(taskFilter);

            const winRate = (wonDeals.length + lostCount) > 0
                ? Math.round((wonDeals.length / (wonDeals.length + lostCount)) * 100)
                : 0;

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                department: user.department,
                revenue,
                dealsWon: wonDeals.length,
                dealsLost: lostCount,
                totalDeals,
                winRate,
                activityCount,
                tasksCompleted,
            };
        }));

        // Sort by revenue descending
        leaderboard.sort((a, b) => b.revenue - a.revenue);

        // Team totals
        const teamTotals = {
            totalRevenue: leaderboard.reduce((sum, u) => sum + u.revenue, 0),
            totalDealsWon: leaderboard.reduce((sum, u) => sum + u.dealsWon, 0),
            totalDealsLost: leaderboard.reduce((sum, u) => sum + u.dealsLost, 0),
            totalActivities: leaderboard.reduce((sum, u) => sum + u.activityCount, 0),
            avgWinRate: leaderboard.length > 0
                ? Math.round(leaderboard.reduce((sum, u) => sum + u.winRate, 0) / leaderboard.length)
                : 0,
        };

        const data = { leaderboard, teamTotals };

        await setCache(cacheKey, data);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────
// GET /api/reports/conversion — Conversion Funnel
// ─────────────────────────────────────────────
exports.getConversionReport = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { startDate, endDate } = req.query;

        const cacheKey = `report:${organizationId}:conversion:${startDate || ''}:${endDate || ''}`;
        const cached = await getCached(cacheKey);
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const dateFilter = buildDateFilter(startDate, endDate);
        const filter = { organizationId };
        if (dateFilter) filter.createdAt = dateFilter;

        // Funnel stages
        const totalLeads = await Lead.countDocuments(filter);
        const contactedLeads = await Lead.countDocuments({ ...filter, status: { $in: ['contacted', 'qualified', 'nurturing', 'converted'] } });
        const qualifiedLeads = await Lead.countDocuments({ ...filter, status: { $in: ['qualified', 'converted'] } });
        const convertedLeads = await Lead.countDocuments({ ...filter, status: 'converted' });

        const dealFilter = { organizationId };
        if (dateFilter) dealFilter.createdAt = dateFilter;
        const totalDeals = await Deal.countDocuments(dealFilter);
        const wonDeals = await Deal.countDocuments({ ...dealFilter, status: 'won' });

        const funnel = [
            { stage: 'All Leads', count: totalLeads, color: '#6366f1' },
            { stage: 'Contacted', count: contactedLeads, color: '#8b5cf6' },
            { stage: 'Qualified', count: qualifiedLeads, color: '#a855f7' },
            { stage: 'Converted', count: convertedLeads, color: '#06b6d4' },
            { stage: 'Deals Created', count: totalDeals, color: '#10b981' },
            { stage: 'Deals Won', count: wonDeals, color: '#22c55e' },
        ];

        // Calculate conversion rates between stages
        const conversionRates = [];
        for (let i = 0; i < funnel.length - 1; i++) {
            const rate = funnel[i].count > 0
                ? Math.round((funnel[i + 1].count / funnel[i].count) * 100)
                : 0;
            conversionRates.push({
                from: funnel[i].stage,
                to: funnel[i + 1].stage,
                rate,
            });
        }

        // Lead source breakdown
        const sourceBreakdown = await Lead.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                    converted: {
                        $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
                    },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const sources = sourceBreakdown.map(s => ({
            source: s._id,
            count: s.count,
            converted: s.converted,
            conversionRate: s.count > 0 ? Math.round((s.converted / s.count) * 100) : 0,
        }));

        const data = {
            funnel,
            conversionRates,
            sources,
            overallConversion: totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0,
        };

        await setCache(cacheKey, data);
        res.json({ success: true, data });
    } catch (error) { next(error); }
};

// Export cache invalidation for use in other controllers
exports.invalidateReportCache = invalidateReportCache;
