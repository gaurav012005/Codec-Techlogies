const User = require('../models/User');
const Pipeline = require('../models/Pipeline');
const CustomField = require('../models/CustomField');
const AuditLog = require('../models/AuditLog');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');

// ═══════ User Management ═══════

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ organizationId: req.organizationId })
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { name, role, department, isActive, phone } = req.body;
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { name, role, department, isActive, phone },
            { new: true, runValidators: true }
        ).select('-password -refreshToken');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await AuditLog.create({
            action: 'user_updated', entity: 'User', entityId: user._id,
            userId: req.user.id, organizationId: req.organizationId,
            changes: req.body, description: `Updated user ${user.name}`,
        });

        res.json({ success: true, data: user });
    } catch (error) { next(error); }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { role },
            { new: true }
        ).select('-password -refreshToken');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await AuditLog.create({
            action: 'role_changed', entity: 'User', entityId: user._id,
            userId: req.user.id, organizationId: req.organizationId,
            changes: { role }, description: `Changed role of ${user.name} to ${role}`,
        });

        res.json({ success: true, data: user });
    } catch (error) { next(error); }
};

exports.deactivateUser = async (req, res, next) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { isActive: false },
            { new: true }
        ).select('-password -refreshToken');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user, message: 'User deactivated' });
    } catch (error) { next(error); }
};

// ═══════ Custom Fields ═══════

exports.getCustomFields = async (req, res, next) => {
    try {
        const { entity } = req.query;
        const filter = { organizationId: req.organizationId };
        if (entity) filter.entity = entity;

        const fields = await CustomField.find(filter).sort({ entity: 1, order: 1 });
        res.json({ success: true, data: fields });
    } catch (error) { next(error); }
};

exports.createCustomField = async (req, res, next) => {
    try {
        const { name, fieldType, entity, options, defaultValue, isRequired, visibleToRoles } = req.body;
        if (!name || !fieldType || !entity) {
            return res.status(400).json({ success: false, message: 'name, fieldType, and entity are required' });
        }

        const count = await CustomField.countDocuments({ organizationId: req.organizationId, entity });
        const field = await CustomField.create({
            name, fieldType, entity, options, defaultValue, isRequired, visibleToRoles,
            order: count,
            createdBy: req.user.id,
            organizationId: req.organizationId,
        });

        await AuditLog.create({
            action: 'custom_field_created', entity: 'CustomField', entityId: field._id,
            userId: req.user.id, organizationId: req.organizationId,
            description: `Created custom field "${name}" for ${entity}`,
        });

        res.status(201).json({ success: true, data: field });
    } catch (error) { next(error); }
};

exports.updateCustomField = async (req, res, next) => {
    try {
        const field = await CustomField.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!field) return res.status(404).json({ success: false, message: 'Custom field not found' });
        res.json({ success: true, data: field });
    } catch (error) { next(error); }
};

exports.deleteCustomField = async (req, res, next) => {
    try {
        const field = await CustomField.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
        if (!field) return res.status(404).json({ success: false, message: 'Custom field not found' });
        res.json({ success: true, message: 'Custom field deleted' });
    } catch (error) { next(error); }
};

// ═══════ Sales Targets ═══════

exports.setTargets = async (req, res, next) => {
    try {
        const { targets } = req.body; // Array of { userId, monthly, quarterly }
        if (!targets || !Array.isArray(targets)) {
            return res.status(400).json({ success: false, message: 'targets array is required' });
        }

        const org = await Organization.findById(req.organizationId);
        if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

        org.settings.targets = targets;
        await org.save();

        res.json({ success: true, data: targets, message: 'Sales targets updated' });
    } catch (error) { next(error); }
};

exports.getTargets = async (req, res, next) => {
    try {
        const org = await Organization.findById(req.organizationId);
        res.json({ success: true, data: org?.settings?.targets || [] });
    } catch (error) { next(error); }
};

// ═══════ Audit Logs ═══════

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { action, entity, userId, startDate, endDate, page = 1, limit = 30 } = req.query;
        const filter = { organizationId: req.organizationId };
        if (action) filter.action = action;
        if (entity) filter.entity = entity;
        if (userId) filter.userId = userId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
                .populate('userId', 'name email'),
            AuditLog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
        });
    } catch (error) { next(error); }
};

// ═══════ Pipeline Configuration ═══════

exports.updatePipelineStages = async (req, res, next) => {
    try {
        const { stages } = req.body;
        if (!stages || !Array.isArray(stages)) {
            return res.status(400).json({ success: false, message: 'stages array is required' });
        }

        const pipeline = await Pipeline.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { stages },
            { new: true, runValidators: true }
        );
        if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });

        await AuditLog.create({
            action: 'pipeline_updated', entity: 'Pipeline', entityId: pipeline._id,
            userId: req.user.id, organizationId: req.organizationId,
            description: `Updated pipeline "${pipeline.name}" stages`,
        });

        res.json({ success: true, data: pipeline });
    } catch (error) { next(error); }
};
