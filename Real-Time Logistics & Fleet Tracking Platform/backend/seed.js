const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        // Run init.sql first
        const initSQL = fs.readFileSync(path.join(__dirname, 'sql', 'init.sql'), 'utf8');
        await pool.query(initSQL);
        console.log('[Seed] Tables created');

        // Hash passwords
        const adminPass = await bcrypt.hash('admin123', 10);
        const driverPass = await bcrypt.hash('driver123', 10);

        // Seed admin
        await pool.query(
            `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = $3`,
            ['Alex Morgan', 'admin@fleettrack.com', adminPass, 'admin']
        );

        // Seed drivers
        const drivers = [
            ['Robert Chambers', 'robert@fleettrack.com'],
            ['Elena Rodriguez', 'elena@fleettrack.com'],
            ['Marcus Smith', 'marcus@fleettrack.com'],
        ];

        for (const [name, email] of drivers) {
            await pool.query(
                `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'driver') ON CONFLICT (email) DO UPDATE SET password = $3`,
                [name, email, driverPass]
            );
        }

        // Get driver IDs
        const driverResults = await pool.query("SELECT id, name FROM users WHERE role = 'driver' ORDER BY id");
        const driverIds = driverResults.rows;

        // Seed vehicles
        const vehicles = [
            { number: 'FT-9023', driver_idx: 0, status: 'active' },
            { number: 'FT-1104', driver_idx: 1, status: 'delayed' },
            { number: 'FT-4482', driver_idx: 2, status: 'idle' },
            { number: 'FT-3011', driver_idx: null, status: 'active' },
            { number: 'FT-7756', driver_idx: null, status: 'idle' },
        ];

        for (const v of vehicles) {
            const driverId = v.driver_idx !== null ? driverIds[v.driver_idx]?.id : null;
            await pool.query(
                `INSERT INTO vehicles (vehicle_number, driver_id, status) VALUES ($1, $2, $3) ON CONFLICT (vehicle_number) DO UPDATE SET driver_id = $2, status = $3`,
                [v.number, driverId, v.status]
            );
        }

        // Get vehicle IDs
        const vehicleResults = await pool.query('SELECT id, vehicle_number FROM vehicles ORDER BY id');
        const vehicleMap = {};
        vehicleResults.rows.forEach(v => { vehicleMap[v.vehicle_number] = v.id; });

        // Seed deliveries
        const deliveries = [
            { pickup: 'Warehouse Alpha, NJ-44', drop: 'Chicago Hub #4', driver_idx: 0, vehicle: 'FT-9023', status: 'in_transit' },
            { pickup: 'Distribution Center B', drop: 'Philadelphia Port', driver_idx: 1, vehicle: 'FT-1104', status: 'in_transit' },
            { pickup: 'Storage Unit 9', drop: 'Maintenance Yard B', driver_idx: 2, vehicle: 'FT-4482', status: 'pending' },
            { pickup: 'Central Depot', drop: 'Boston Terminal', driver_idx: 0, vehicle: 'FT-9023', status: 'delivered' },
            { pickup: 'Port Authority', drop: 'Downtown Office', driver_idx: 1, vehicle: 'FT-1104', status: 'delivered' },
        ];

        for (const d of deliveries) {
            const driverId = driverIds[d.driver_idx]?.id;
            const vehicleId = vehicleMap[d.vehicle];
            await pool.query(
                `INSERT INTO deliveries (pickup_location, drop_location, driver_id, vehicle_id, status) VALUES ($1, $2, $3, $4, $5)`,
                [d.pickup, d.drop, driverId, vehicleId, d.status]
            );
        }

        // Seed tracking logs (NYC area coordinates)
        const trackingData = [
            { vehicle: 'FT-9023', lat: 40.7282, lng: -74.0776 },
            { vehicle: 'FT-1104', lat: 40.7061, lng: -74.0087 },
            { vehicle: 'FT-4482', lat: 40.6892, lng: -74.0445 },
        ];

        for (const t of trackingData) {
            const vehicleId = vehicleMap[t.vehicle];
            if (vehicleId) {
                await pool.query(
                    'INSERT INTO tracking_logs (vehicle_id, latitude, longitude) VALUES ($1, $2, $3)',
                    [vehicleId, t.lat, t.lng]
                );
            }
        }

        console.log('[Seed] Data seeded successfully!');
        console.log('[Seed] Admin login: admin@fleettrack.com / admin123');
        console.log('[Seed] Driver login: robert@fleettrack.com / driver123');
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Error:', error);
        process.exit(1);
    }
}

seed();
