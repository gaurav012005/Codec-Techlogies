const express = require('express');
const { body } = require('express-validator');
const { register, login, forgotPassword, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['recruiter', 'hr_admin', 'hiring_manager', 'candidate']).withMessage('Invalid role'),
], register);

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
], login);

// POST /api/auth/forgot-password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email'),
], forgotPassword);

// GET /api/auth/me (protected)
router.get('/me', auth, getMe);

module.exports = router;
