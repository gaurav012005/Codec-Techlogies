const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getTasks = async (req, res, next) => {
    try {
        const { organizationId } = req;
        const { status, priority, assignedTo, search, dueDate, sortBy = 'dueDate', order = 'asc', page = 1, limit = 30 } = req.query;
        const filter = { organizationId };

        if (req.user.role === 'sales_executive') filter.assignedTo = req.user.id;
        else if (assignedTo) filter.assignedTo = assignedTo;

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (search) filter.title = { $regex: search, $options: 'i' };

        // Due date filters
        if (dueDate === 'today') {
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setHours(23, 59, 59, 999);
            filter.dueDate = { $gte: start, $lte: end };
        } else if (dueDate === 'week') {
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(start); end.setDate(end.getDate() + 7);
            filter.dueDate = { $gte: start, $lte: end };
        } else if (dueDate === 'overdue') {
            filter.dueDate = { $lt: new Date() };
            filter.status = { $nin: ['completed', 'cancelled'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [tasks, total] = await Promise.all([
            Task.find(filter)
                .populate('assignedTo', 'name email avatar')
                .populate('createdBy', 'name')
                .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
                .skip(skip).limit(parseInt(limit)),
            Task.countDocuments(filter),
        ]);

        res.json({ success: true, data: { tasks, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
};

exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId })
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, data: task });
    } catch (error) { next(error); }
};

exports.createTask = async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            assignedTo: req.body.assignedTo || req.user.id,
            createdBy: req.user.id,
            organizationId: req.organizationId,
        });

        if (task.relatedTo && task.relatedModel) {
            await Activity.create({
                type: 'task', title: `Task created: "${task.title}"`,
                relatedTo: task.relatedTo, relatedModel: task.relatedModel,
                userId: req.user.id, organizationId: req.organizationId,
            });
        }

        res.status(201).json({ success: true, data: task });
    } catch (error) { next(error); }
};

exports.updateTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body, { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, data: task });
    } catch (error) { next(error); }
};

exports.completeTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { status: 'completed', completedAt: new Date() },
            { new: true }
        );
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.relatedTo && task.relatedModel) {
            await Activity.create({
                type: 'task', title: `Task completed: "${task.title}"`,
                relatedTo: task.relatedTo, relatedModel: task.relatedModel,
                userId: req.user.id, organizationId: req.organizationId,
            });
        }

        res.json({ success: true, data: task });
    } catch (error) { next(error); }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, message: 'Task deleted' });
    } catch (error) { next(error); }
};

exports.getTaskStats = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        const { organizationId } = req;
        const orgId = new mongoose.Types.ObjectId(organizationId);
        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

        const [total, pending, completed, overdue, dueToday] = await Promise.all([
            Task.countDocuments({ organizationId: orgId }),
            Task.countDocuments({ organizationId: orgId, status: 'pending' }),
            Task.countDocuments({ organizationId: orgId, status: 'completed' }),
            Task.countDocuments({ organizationId: orgId, dueDate: { $lt: now }, status: { $nin: ['completed', 'cancelled'] } }),
            Task.countDocuments({ organizationId: orgId, dueDate: { $gte: todayStart, $lte: todayEnd }, status: { $nin: ['completed', 'cancelled'] } }),
        ]);

        res.json({ success: true, data: { total, pending, completed, overdue, dueToday } });
    } catch (error) { next(error); }
};
