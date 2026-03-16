// ============================================
// Auth Controller — Register, Login, Refresh, Logout
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { AppError } = require('../middleware/error.middleware');
const crypto = require('crypto');

// Generate JWT access token
const generateAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });
};

// Generate refresh token
const generateRefreshToken = async (userId) => {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
        data: { token, userId, expiresAt },
    });

    return token;
};

// ===== REGISTER =====
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new AppError('Email already registered.', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = await generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
};

// ===== LOGIN =====
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is blocked. Contact admin.', 403);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = await generateRefreshToken(user.id);

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            avatarUrl: user.avatarUrl,
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: userData,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
};

// ===== REFRESH TOKEN =====
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError('Refresh token required.', 400);
        }

        // Find token
        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!stored || stored.expiresAt < new Date()) {
            if (stored) {
                await prisma.refreshToken.delete({ where: { id: stored.id } });
            }
            throw new AppError('Invalid or expired refresh token.', 401);
        }

        // Rotate: delete old, create new
        await prisma.refreshToken.delete({ where: { id: stored.id } });

        const newAccessToken = generateAccessToken(stored.user.id, stored.user.role);
        const newRefreshToken = await generateRefreshToken(stored.user.id);

        res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        next(error);
    }
};

// ===== LOGOUT =====
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// ===== GET CURRENT USER =====
exports.me = async (req, res) => {
    res.json({ success: true, user: req.user });
};
