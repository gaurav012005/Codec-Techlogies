// ============================================
// Auth Routes — /api/auth
// ============================================

const express = require('express');
const router = express.Router();

// Placeholder — will be implemented in Feature 2
router.post('/register', (req, res) => {
    res.status(501).json({ message: 'Register endpoint — coming in Feature 2' });
});

router.post('/login', (req, res) => {
    res.status(501).json({ message: 'Login endpoint — coming in Feature 2' });
});

router.post('/refresh', (req, res) => {
    res.status(501).json({ message: 'Refresh token endpoint — coming in Feature 2' });
});

router.post('/logout', (req, res) => {
    res.status(501).json({ message: 'Logout endpoint — coming in Feature 2' });
});

module.exports = router;
