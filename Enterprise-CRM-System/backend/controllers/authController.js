const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role, organizationId: user.organizationId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, companyName, industry } = req.body;

        // Check if email already exists across all organizations
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Create slug from company name
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if organization slug exists
        const existingOrg = await Organization.findOne({ slug });
        if (existingOrg) {
            return res.status(409).json({ success: false, message: 'Organization name already taken' });
        }

        // Create organization
        const organization = await Organization.create({
            name: companyName,
            slug,
            industry: industry || '',
        });

        // Create super admin user
        const user = await User.create({
            name,
            email,
            password,
            role: 'super_admin',
            organizationId: organization._id,
        });

        // Update organization owner
        organization.owner = user._id;
        await organization.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Save refresh token
        user.refreshToken = refreshToken;
        await User.findByIdAndUpdate(user._id, { refreshToken });

        // Audit log
        await AuditLog.create({
            userId: user._id,
            organizationId: organization._id,
            action: 'register',
            entity: 'user',
            entityId: user._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent') || '',
        });

        logger.info(`New registration: ${email} (Org: ${companyName})`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: user.toJSON(),
                organization: { id: organization._id, name: organization.name, slug: organization.slug, plan: organization.plan },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Save refresh token and last login
        await User.findByIdAndUpdate(user._id, { refreshToken, lastLoginAt: new Date() });

        // Get organization
        const organization = await Organization.findById(user.organizationId);

        // Audit log
        await AuditLog.create({
            userId: user._id,
            organizationId: user.organizationId,
            action: 'login',
            entity: 'user',
            entityId: user._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent') || '',
        });

        logger.info(`Login: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                organization: organization ? { id: organization._id, name: organization.name, slug: organization.slug, plan: organization.plan } : null,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Rotate tokens
        const tokens = generateTokens(user);
        await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

        // Invalidate old Redis cache
        const redis = getRedis();
        if (redis) {
            try { await redis.del(`user:${user._id}`); } catch (e) { /* ignore */ }
        }

        res.json({
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Refresh token expired, please login again' });
        }
        next(error);
    }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const organization = await Organization.findById(req.user.organizationId);

        res.json({
            success: true,
            data: {
                user,
                organization: organization ? { id: organization._id, name: organization.name, slug: organization.slug, plan: organization.plan, settings: organization.settings } : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

        // Clear Redis cache
        const redis = getRedis();
        if (redis) {
            try { await redis.del(`user:${req.user.id}`); } catch (e) { /* ignore */ }
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
