// Tenant isolation middleware - automatically scopes queries to user's organization
const tenantMiddleware = (req, res, next) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Organization context required' });
    }

    // Attach organizationId to request for easy access in controllers
    req.organizationId = req.user.organizationId;

    // Override req.query to always include organizationId for list queries
    if (req.method === 'GET') {
        req.query.organizationId = req.user.organizationId;
    }

    next();
};

module.exports = tenantMiddleware;
