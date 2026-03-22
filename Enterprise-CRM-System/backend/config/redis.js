const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = () => {
    try {
        redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    logger.warn('Redis: Max retries reached, running without cache');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
        });

        redis.on('connect', () => logger.info('Redis Connected'));
        redis.on('error', (err) => logger.warn(`Redis Error: ${err.message}`));

        return redis;
    } catch (error) {
        logger.warn(`Redis not available, running without cache: ${error.message}`);
        return null;
    }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
