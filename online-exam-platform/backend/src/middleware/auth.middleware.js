// ============================================
// JWT Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { AppError } = require('./error.middleware');

/**
 * Verify JWT access token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                avatarUrl: true,
            },
        });

        if (!user) {
            throw new AppError('User not found. Token invalid.', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is blocked. Contact admin.', 403);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Authorize specific roles
 * Usage: authorize('ADMIN', 'EXAMINER')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(`Access denied. Required role(s): ${roles.join(', ')}`, 403));
        }

        next();
    };
};

module.exports = { authenticate, authorize };
