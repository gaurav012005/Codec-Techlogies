const express = require('express');
const pool = require('../config/db');
const { authenticateToken, requireDriver } = require('../middleware/auth');

const router = express.Router();

// GET /api/driver/deliveries - Get deliveries assigned to the logged-in driver
router.get('/deliveries', authenticateToken, requireDriver, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, v.vehicle_number
            FROM deliveries d
            LEFT JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.driver_id = $1
            ORDER BY
                CASE d.status
                    WHEN 'picked_up' THEN 1
                    WHEN 'in_transit' THEN 2
                    WHEN 'assigned' THEN 3
                    WHEN 'pending' THEN 4
                    WHEN 'delivered' THEN 5
                END,
                d.scheduled_time ASC NULLS LAST
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Driver deliveries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/driver/deliveries/:id/status - Update delivery status (driver only)
router.put('/deliveries/:id/status', authenticateToken, requireDriver, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['picked_up', 'in_transit', 'delivered'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
        }

        const fields = [`status = $1`];
        const values = [status];
        if (status === 'delivered') {
            fields.push('delivered_at = CURRENT_TIMESTAMP');
        }

        values.push(req.user.id, id);
        const result = await pool.query(
            `UPDATE deliveries SET ${fields.join(', ')} WHERE driver_id = $${values.length - 1} AND id = $${values.length} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found or not assigned to you' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Driver status update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
