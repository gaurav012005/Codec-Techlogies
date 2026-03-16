const pool = require('../config/db');

// Setup Socket.io tracking handlers
function setupTracking(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Driver sends location update
        socket.on('location:update', async (data) => {
            try {
                const { vehicle_id, latitude, longitude } = data;

                if (!vehicle_id || latitude == null || longitude == null) {
                    socket.emit('error', { message: 'vehicle_id, latitude, longitude are required' });
                    return;
                }

                // Store tracking log in DB
                await pool.query(
                    'INSERT INTO tracking_logs (vehicle_id, latitude, longitude) VALUES ($1, $2, $3)',
                    [vehicle_id, latitude, longitude]
                );

                // Get vehicle info for broadcast
                const vehicleResult = await pool.query(
                    'SELECT v.vehicle_number, v.status FROM vehicles v WHERE v.id = $1',
                    [vehicle_id]
                );

                const vehicleInfo = vehicleResult.rows[0] || {};

                // Broadcast to all connected admin clients
                io.emit('location:broadcast', {
                    vehicle_id,
                    vehicle_number: vehicleInfo.vehicle_number || `Vehicle-${vehicle_id}`,
                    status: vehicleInfo.status || 'active',
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString(),
                });

                console.log(`[Tracking] Vehicle ${vehicle_id} -> lat:${latitude}, lng:${longitude}`);
            } catch (error) {
                console.error('[Tracking] Error saving location:', error);
                socket.emit('error', { message: 'Failed to save location' });
            }
        });

        // Live feed events (admin notifications)
        socket.on('feed:event', (data) => {
            io.emit('feed:broadcast', {
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
}

module.exports = { setupTracking };
