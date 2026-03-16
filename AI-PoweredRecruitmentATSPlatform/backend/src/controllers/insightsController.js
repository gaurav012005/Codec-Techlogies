const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

// GET /api/insights/overview — aggregate real data for AI Insights Hub
const getInsightsOverview = async (req, res) => {
    try {
        // Job stats
        const [totalJobs, activeJobs, closedJobs] = await Promise.all([
            Job.countDocuments(),
            Job.countDocuments({ status: 'active' }),
            Job.countDocuments({ status: 'closed' }),
        ]);

        // Candidate stats
        const [totalCandidates] = await Promise.all([
            Candidate.countDocuments(),
        ]);

        // Department breakdown
        const deptPipeline = await Job.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]);

        // Source breakdown
        const sourcePipeline = await Candidate.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Recent candidates (top AI scores)
        const topCandidates = await Candidate.find()
            .sort('-aiScore')
            .limit(5)
            .select('firstName lastName headline aiScore source tags skills location');

        // Interview stats
        const [totalInterviews, scheduledInterviews, completedInterviews] = await Promise.all([
            Interview.countDocuments(),
            Interview.countDocuments({ status: { $in: ['scheduled', 'confirmed'] } }),
            Interview.countDocuments({ status: 'completed' }),
        ]);

        // Stage counts from candidates
        const stagePipeline = await Candidate.aggregate([
            { $unwind: { path: '$appliedJobs', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$appliedJobs.stage', count: { $sum: 1 } } },
        ]);

        const stages = {};
        stagePipeline.forEach(s => { stages[s._id] = s.count; });

        // Recent jobs for funnel
        const recentJobs = await Job.find({ status: 'active' })
            .sort('-createdAt')
            .limit(5)
            .select('title department totalApplicants pipeline createdAt');

        res.json({
            kpis: {
                totalJobs,
                activeJobs,
                closedJobs,
                totalCandidates,
                totalInterviews,
                scheduledInterviews,
                completedInterviews,
            },
            departments: deptPipeline.map(d => ({ name: d._id || 'Other', count: d.count })),
            sources: sourcePipeline.map(s => ({ name: s._id || 'Other', count: s.count })),
            topCandidates: topCandidates.map(c => ({
                _id: c._id,
                name: `${c.firstName} ${c.lastName}`,
                headline: c.headline || '',
                aiScore: c.aiScore || 0,
                source: c.source || '',
                tags: c.tags || [],
                skills: (c.skills || []).slice(0, 3).map(s => s.name || s),
            })),
            stages,
            recentJobs,
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getInsightsOverview };
