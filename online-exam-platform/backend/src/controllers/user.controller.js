// ============================================
// User Controller — Admin CRUD + Block/Unblock
// ============================================

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

// ===== LIST ALL USERS (paginated, filterable) =====
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, search, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (role) where.role = role;
        if (status === 'active') where.isActive = true;
        if (status === 'blocked') where.isActive = false;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, name: true, email: true, role: true,
                    isActive: true, avatarUrl: true, createdAt: true,
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// ===== GET SINGLE USER =====
exports.getUser = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, name: true, email: true, role: true,
                isActive: true, avatarUrl: true, createdAt: true, updatedAt: true,
            },
        });
        if (!user) throw new AppError('User not found.', 404);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// ===== CREATE USER (Admin) =====
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new AppError('Email already registered.', 409);

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: role || 'STUDENT' },
            select: {
                id: true, name: true, email: true, role: true,
                isActive: true, createdAt: true,
            },
        });

        res.status(201).json({ success: true, message: 'User created', user });
    } catch (error) {
        next(error);
    }
};

// ===== UPDATE USER =====
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role } = req.body;

        // Check email uniqueness if changing
        if (email) {
            const existing = await prisma.user.findFirst({
                where: { email, NOT: { id: req.params.id } },
            });
            if (existing) throw new AppError('Email already in use.', 409);
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
            },
            select: {
                id: true, name: true, email: true, role: true,
                isActive: true, createdAt: true,
            },
        });

        res.json({ success: true, message: 'User updated', user });
    } catch (error) {
        next(error);
    }
};

// ===== DELETE USER (soft — mark inactive) =====
exports.deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            throw new AppError('Cannot delete your own account.', 400);
        }

        await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });

        res.json({ success: true, message: 'User deleted (deactivated)' });
    } catch (error) {
        next(error);
    }
};

// ===== BLOCK / UNBLOCK USER =====
exports.toggleBlock = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            throw new AppError('Cannot block your own account.', 400);
        }

        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) throw new AppError('User not found.', 404);

        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: !user.isActive },
            select: { id: true, name: true, isActive: true },
        });

        res.json({
            success: true,
            message: updated.isActive ? 'User unblocked' : 'User blocked',
            user: updated,
        });
    } catch (error) {
        next(error);
    }
};

// ===== RESET USER PASSWORD (Admin) =====
exports.resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            throw new AppError('Password must be at least 6 characters.', 400);
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: req.params.id },
            data: { passwordHash },
        });

        // Invalidate all refresh tokens
        await prisma.refreshToken.deleteMany({ where: { userId: req.params.id } });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};
