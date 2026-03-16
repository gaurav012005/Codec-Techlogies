const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver');
const deliveryRoutes = require('./routes/delivery');
const analyticsRoutes = require('./routes/analytics');
const { setupTracking } = require('./sockets/tracking');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io tracking
setupTracking(io);

// Initialize database tables
async function initDB() {
    try {
        const fs = require('fs');
        const initSQL = fs.readFileSync(path.join(__dirname, 'sql', 'init.sql'), 'utf8');
        await pool.query(initSQL);
        console.log('[DB] Database tables initialized successfully');
    } catch (error) {
        console.error('[DB] Error initializing database:', error.message);
        console.log('[DB] Make sure PostgreSQL is running and the database "fleettrack" exists');
    }
}

// Start server
server.listen(PORT, async () => {
    console.log(`\n  FleetTrack Pro Backend`);
    console.log(`  ---------------------`);
    console.log(`  Server:    http://localhost:${PORT}`);
    console.log(`  Socket.io: ws://localhost:${PORT}`);
    console.log(`  Health:    http://localhost:${PORT}/api/health\n`);
    await initDB();
});

module.exports = { app, server, io };
