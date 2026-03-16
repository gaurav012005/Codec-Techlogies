// ============================================
// Centralized Error Handling Middleware
// ============================================

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Prisma known request error
    if (err.code === 'P2002') {
        statusCode = 409;
        const field = err.meta?.target?.join(', ') || 'field';
        message = `Duplicate value for: ${field}. This record already exists.`;
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found.';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    // Validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { AppError, errorHandler, notFoundHandler };
