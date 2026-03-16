const express = require('express');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/analytics - Aggregated analytics data
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Deliveries per day (last 7 days)
        const dailyDeliveries = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM deliveries
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);

        // Status breakdown
        const statusBreakdown = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM deliveries
            GROUP BY status
        `);

        // Top 5 drivers by completed deliveries
        const topDrivers = await pool.query(`
            SELECT u.name, COUNT(d.id) as completed
            FROM deliveries d
            JOIN users u ON d.driver_id = u.id
            WHERE d.status = 'delivered'
            GROUP BY u.id, u.name
            ORDER BY completed DESC
            LIMIT 5
        `);

        // Summary KPIs
        const total = await pool.query('SELECT COUNT(*) FROM deliveries');
        const completed = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status = 'delivered'");
        const activeDrivers = await pool.query("SELECT COUNT(DISTINCT driver_id) FROM deliveries WHERE status IN ('assigned', 'picked_up', 'in_transit')");
        const totalDrivers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'driver'");

        const totalCount = parseInt(total.rows[0].count);
        const completedCount = parseInt(completed.rows[0].count);
        const successRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0.0';

        res.json({
            dailyDeliveries: dailyDeliveries.rows.map(r => ({ date: r.date, count: parseInt(r.count) })),
            statusBreakdown: statusBreakdown.rows.map(r => ({ status: r.status, count: parseInt(r.count) })),
            topDrivers: topDrivers.rows.map(r => ({ name: r.name, completed: parseInt(r.completed) })),
            kpis: {
                totalDeliveries: totalCount,
                completedDeliveries: completedCount,
                successRate: parseFloat(successRate),
                activeDrivers: parseInt(activeDrivers.rows[0].count),
                totalDrivers: parseInt(totalDrivers.rows[0].count),
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
