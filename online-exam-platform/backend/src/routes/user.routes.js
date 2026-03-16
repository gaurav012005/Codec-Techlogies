// ============================================
// User Routes — /api/users (Admin only)
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// All routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/users — list all users
router.get('/', userController.getUsers);

// GET /api/users/:id — get single user
router.get('/:id', userController.getUser);

// POST /api/users — create user
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['ADMIN', 'EXAMINER', 'STUDENT']).withMessage('Invalid role'),
    ],
    validate,
    userController.createUser
);

// PUT /api/users/:id — update user
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
        body('role').optional().isIn(['ADMIN', 'EXAMINER', 'STUDENT']).withMessage('Invalid role'),
    ],
    validate,
    userController.updateUser
);

// DELETE /api/users/:id — soft delete
router.delete('/:id', userController.deleteUser);

// PATCH /api/users/:id/block — toggle block/unblock
router.patch('/:id/block', userController.toggleBlock);

// POST /api/users/:id/reset-password
router.post(
    '/:id/reset-password',
    [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
    validate,
    userController.resetPassword
);

module.exports = router;
