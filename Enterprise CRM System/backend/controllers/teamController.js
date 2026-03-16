const Team = require('../models/Team');
const User = require('../models/User');
const logger = require('../utils/logger');

// GET /api/admin/teams
exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find({ organizationId: req.organizationId })
            .populate('teamLead', 'name email role')
            .populate('members', 'name email role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: teams });
    } catch (error) {
        logger.error('Get teams error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch teams' });
    }
};

// GET /api/admin/teams/:id
exports.getTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('teamLead', 'name email role')
            .populate('members', 'name email role');

        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch team' });
    }
};

// POST /api/admin/teams
exports.createTeam = async (req, res) => {
    try {
        const { name, description, department, teamLead, members, targets, color } = req.body;

        const team = await Team.create({
            name,
            description,
            department,
            teamLead,
            members: members || [],
            targets: targets || {},
            color: color || '#6366f1',
            organizationId: req.organizationId,
        });

        const populated = await Team.findById(team._id)
            .populate('teamLead', 'name email role')
            .populate('members', 'name email role');

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        logger.error('Create team error:', error);
        res.status(500).json({ success: false, message: 'Failed to create team' });
    }
};

// PUT /api/admin/teams/:id
exports.updateTeam = async (req, res) => {
    try {
        const { name, description, department, teamLead, members, targets, color, isActive } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (department !== undefined) updateData.department = department;
        if (teamLead !== undefined) updateData.teamLead = teamLead;
        if (members !== undefined) updateData.members = members;
        if (targets !== undefined) updateData.targets = targets;
        if (color !== undefined) updateData.color = color;
        if (isActive !== undefined) updateData.isActive = isActive;

        const team = await Team.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            updateData,
            { new: true }
        ).populate('teamLead', 'name email role').populate('members', 'name email role');

        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update team' });
    }
};

// DELETE /api/admin/teams/:id
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, message: 'Team deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete team' });
    }
};

// PUT /api/admin/teams/:id/members — Add/remove members
exports.updateMembers = async (req, res) => {
    try {
        const { add, remove } = req.body;
        const team = await Team.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        if (add && Array.isArray(add)) {
            add.forEach(userId => {
                if (!team.members.includes(userId)) team.members.push(userId);
            });
        }
        if (remove && Array.isArray(remove)) {
            team.members = team.members.filter(m => !remove.includes(m.toString()));
        }

        await team.save();
        const populated = await Team.findById(team._id)
            .populate('teamLead', 'name email role')
            .populate('members', 'name email role');

        res.json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update members' });
    }
};
