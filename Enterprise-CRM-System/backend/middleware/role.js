const PERMISSIONS = {
    super_admin: ['*'],
    sales_manager: [
        'leads:read', 'leads:write', 'leads:delete',
        'contacts:read', 'contacts:write',
        'companies:read', 'companies:write',
        'deals:read', 'deals:write', 'deals:delete',
        'tasks:read', 'tasks:write',
        'activities:read', 'activities:write',
        'reports:read',
        'pipelines:read', 'pipelines:write',
        'import:read', 'import:write',
        'export:read', 'export:write',
        'team:read',
    ],
    sales_executive: [
        'leads:read', 'leads:write',
        'contacts:read', 'contacts:write',
        'companies:read',
        'deals:read', 'deals:write',
        'tasks:read', 'tasks:write',
        'activities:read', 'activities:write',
        'reports:read:own',
        'pipelines:read',
    ],
    support: [
        'contacts:read',
        'companies:read',
        'activities:read', 'activities:write',
        'tasks:read', 'tasks:write',
    ],
    analyst: [
        'leads:read',
        'contacts:read',
        'companies:read',
        'deals:read',
        'reports:read',
        'pipelines:read',
    ],
};

const roleMiddleware = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userPermissions = PERMISSIONS[req.user.role] || [];

        // Super admin has all permissions
        if (userPermissions.includes('*')) {
            return next();
        }

        const hasPermission = requiredPermissions.every((perm) =>
            userPermissions.includes(perm)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }

        next();
    };
};

module.exports = { roleMiddleware, PERMISSIONS };
