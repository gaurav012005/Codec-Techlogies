const jwt = require('jsonwebtoken');
const { getRedis } = require('../config/redis');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try Redis cache first
        const redis = getRedis();
        if (redis) {
            try {
                const cached = await redis.get(`user:${decoded.id}`);
                if (cached) {
                    req.user = JSON.parse(cached);
                    return next();
                }
            } catch (err) {
                logger.warn('Redis cache read failed, falling back to DB');
            }
        }

        // Fallback to DB
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User not found or deactivated' });
        }

        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId.toString(),
            avatar: user.avatar,
        };

        // Cache in Redis for 15 min
        if (redis) {
            try {
                await redis.setex(`user:${decoded.id}`, 900, JSON.stringify(userData));
            } catch (err) {
                logger.warn('Redis cache write failed');
            }
        }

        req.user = userData;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
