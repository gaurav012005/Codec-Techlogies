const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// GET /api/pipeline/:jobId — get candidates grouped by stage for a job
const getPipeline = async (req, res) => {
    try {
        const { jobId } = req.params;

        const candidates = await Candidate.find({ 'appliedJobs.job': jobId })
            .select('firstName lastName email headline location avatar aiScore skills tags appliedJobs')
            .lean();

        const stages = ['sourced', 'applied', 'screening', 'interview', 'offered', 'hired', 'rejected'];
        const pipeline = {};
        stages.forEach(s => { pipeline[s] = []; });

        candidates.forEach(c => {
            const application = c.appliedJobs.find(aj => aj.job.toString() === jobId);
            if (application) {
                pipeline[application.stage] = pipeline[application.stage] || [];
                pipeline[application.stage].push({
                    ...c,
                    currentStage: application.stage,
                    appliedAt: application.appliedAt,
                    notes: application.notes,
                });
            }
        });

        res.json({ pipeline, stages });
    } catch (error) {
        console.error('Get pipeline error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/pipeline/move — move candidate between stages
const moveCandidate = async (req, res) => {
    try {
        const { candidateId, jobId, fromStage, toStage } = req.body;

        if (!candidateId || !jobId || !toStage) {
            return res.status(400).json({ message: 'candidateId, jobId, and toStage are required' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        const applicationIndex = candidate.appliedJobs.findIndex(
            aj => aj.job.toString() === jobId
        );

        if (applicationIndex === -1) {
            return res.status(404).json({ message: 'Candidate has not applied for this job' });
        }

        const oldStage = candidate.appliedJobs[applicationIndex].stage;
        candidate.appliedJobs[applicationIndex].stage = toStage;
        await candidate.save();

        // Update job pipeline counts
        const job = await Job.findById(jobId);
        if (job) {
            if (job.pipeline[oldStage] !== undefined) job.pipeline[oldStage] = Math.max(0, job.pipeline[oldStage] - 1);
            if (job.pipeline[toStage] !== undefined) job.pipeline[toStage] = (job.pipeline[toStage] || 0) + 1;
            await job.save();
        }

        res.json({ message: 'Candidate moved successfully', candidate });
    } catch (error) {
        console.error('Move candidate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPipeline, moveCandidate };
