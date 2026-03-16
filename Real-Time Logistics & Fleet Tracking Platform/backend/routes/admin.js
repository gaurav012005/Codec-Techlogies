const express = require('express');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard - Get dashboard KPI data
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalVehicles = await pool.query('SELECT COUNT(*) FROM vehicles');
        const activeDeliveries = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status IN ('assigned', 'picked_up', 'in_transit')");
        const completedToday = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status = 'delivered' AND delivered_at::date = CURRENT_DATE");
        const delayedVehicles = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'delayed'");

        res.json({
            totalVehicles: parseInt(totalVehicles.rows[0].count),
            activeDeliveries: parseInt(activeDeliveries.rows[0].count),
            completedToday: parseInt(completedToday.rows[0].count),
            delayedUnits: parseInt(delayedVehicles.rows[0].count),
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/vehicles - Get all vehicles with driver info
router.get('/vehicles', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT v.id, v.vehicle_number, v.status, u.name as driver_name, u.id as driver_id
      FROM vehicles v
      LEFT JOIN users u ON v.driver_id = u.id
      ORDER BY v.id
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Vehicles error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/vehicles - Create vehicle
router.post('/vehicles', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { vehicle_number, driver_id } = req.body;
        const result = await pool.query(
            'INSERT INTO vehicles (vehicle_number, driver_id) VALUES ($1, $2) RETURNING *',
            [vehicle_number, driver_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/deliveries - Get all deliveries
router.get('/deliveries', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT d.*, u.name as driver_name, v.vehicle_number
      FROM deliveries d
      LEFT JOIN users u ON d.driver_id = u.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      ORDER BY d.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Deliveries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/deliveries - Create delivery
router.post('/deliveries', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { pickup_location, drop_location, driver_id, vehicle_id, scheduled_time } = req.body;
        const result = await pool.query(
            'INSERT INTO deliveries (pickup_location, drop_location, driver_id, vehicle_id, scheduled_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [pickup_location, drop_location, driver_id || null, vehicle_id || null, scheduled_time || null, driver_id ? 'assigned' : 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create delivery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/drivers - Get all drivers
router.get('/drivers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, created_at FROM users WHERE role = 'driver' ORDER BY name");
        res.json(result.rows);
    } catch (error) {
        console.error('Drivers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/admin/deliveries/:id - Update delivery
router.put('/deliveries/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, driver_id, vehicle_id, notes, pickup_location, drop_location, scheduled_time } = req.body;
        const fields = [];
        const values = [];
        let idx = 1;

        if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
        if (driver_id !== undefined) { fields.push(`driver_id = $${idx++}`); values.push(driver_id); }
        if (vehicle_id !== undefined) { fields.push(`vehicle_id = $${idx++}`); values.push(vehicle_id); }
        if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }
        if (pickup_location !== undefined) { fields.push(`pickup_location = $${idx++}`); values.push(pickup_location); }
        if (drop_location !== undefined) { fields.push(`drop_location = $${idx++}`); values.push(drop_location); }
        if (scheduled_time !== undefined) { fields.push(`scheduled_time = $${idx++}`); values.push(scheduled_time); }
        if (status === 'delivered') { fields.push(`delivered_at = CURRENT_TIMESTAMP`); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        values.push(id);
        const result = await pool.query(
            `UPDATE deliveries SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update delivery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/deliveries/:id - Delete delivery
router.delete('/deliveries/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM deliveries WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
        res.json({ message: 'Delivery deleted', id: result.rows[0].id });
    } catch (error) {
        console.error('Delete delivery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/drivers - Get all drivers with delivery counts
router.get('/drivers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.name, u.email, u.created_at,
                   COUNT(d.id) as delivery_count
            FROM users u
            LEFT JOIN deliveries d ON d.driver_id = u.id
            WHERE u.role = 'driver'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows.map(r => ({ ...r, delivery_count: parseInt(r.delivery_count) })));
    } catch (error) {
        console.error('Drivers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/deliveries/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const total = await pool.query('SELECT COUNT(*) FROM deliveries');
        const inTransit = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status IN ('assigned', 'picked_up', 'in_transit')");
        const completed = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status = 'delivered'");
        const delayed = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'delayed'");
        const totalCount = parseInt(total.rows[0].count);
        const completedCount = parseInt(completed.rows[0].count);
        const efficiency = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0.0';

        res.json({
            totalDeliveries: totalCount,
            inTransit: parseInt(inTransit.rows[0].count),
            avgDeliveryTime: '28m 40s',
            fleetEfficiency: parseFloat(efficiency),
            delayedVehicles: parseInt(delayed.rows[0].count),
        });
    } catch (error) {
        console.error('Delivery stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/admin/drivers/:id - Update driver
router.put('/drivers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const result = await pool.query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 AND role = $4 RETURNING id, name, email, created_at',
            [name, email, id, 'driver']
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/drivers/:id - Delete driver
router.delete('/drivers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Unassign from vehicles first
        await pool.query('UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1', [id]);
        await pool.query('UPDATE deliveries SET driver_id = NULL WHERE driver_id = $1', [id]);
        const result = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'driver' RETURNING id", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
        res.json({ message: 'Driver deleted', id: result.rows[0].id });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/tracking - Get latest tracking positions for all vehicles
router.get('/tracking', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT DISTINCT ON (tl.vehicle_id)
        tl.vehicle_id, tl.latitude, tl.longitude, tl.timestamp,
        v.vehicle_number, v.status
      FROM tracking_logs tl
      JOIN vehicles v ON tl.vehicle_id = v.id
      ORDER BY tl.vehicle_id, tl.timestamp DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/admin/vehicles/:id - Update vehicle
router.put('/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicle_number, driver_id, status } = req.body;
        const fields = [];
        const values = [];
        let idx = 1;

        if (vehicle_number !== undefined) { fields.push(`vehicle_number = $${idx++}`); values.push(vehicle_number); }
        if (driver_id !== undefined) { fields.push(`driver_id = $${idx++}`); values.push(driver_id || null); }
        if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        values.push(id);
        const result = await pool.query(
            `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/vehicles/:id - Delete vehicle
router.delete('/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE deliveries SET vehicle_id = NULL WHERE vehicle_id = $1', [id]);
        const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted', id: result.rows[0].id });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/deliveries/:id - Get single delivery
router.get('/deliveries/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT d.*, u.name as driver_name, u.email as driver_email, v.vehicle_number
            FROM deliveries d
            LEFT JOIN users u ON d.driver_id = u.id
            LEFT JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get delivery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
