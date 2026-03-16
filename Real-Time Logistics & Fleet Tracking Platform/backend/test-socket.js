// Test script: Simulates a driver vehicle sending location updates every 5 seconds
const { io } = require('socket.io-client');

const BACKEND_URL = 'http://localhost:5000';
const VEHICLE_ID = 1; // FT-9023

// Starting position (NYC area)
let lat = 40.7282;
let lng = -74.0776;

const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log(`[Test] Connected to server: ${socket.id}`);
    console.log(`[Test] Simulating Vehicle ID: ${VEHICLE_ID}`);
    console.log(`[Test] Sending location updates every 5 seconds...\n`);

    // Send location updates every 5 seconds
    setInterval(() => {
        // Simulate small movement
        lat += (Math.random() - 0.5) * 0.002;
        lng += (Math.random() - 0.5) * 0.002;

        const locationData = {
            vehicle_id: VEHICLE_ID,
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6)),
        };

        socket.emit('location:update', locationData);
        console.log(`[Test] Sent: lat=${locationData.latitude}, lng=${locationData.longitude}`);
    }, 5000);
});

socket.on('location:broadcast', (data) => {
    console.log(`[Test] Broadcast received:`, data);
});

socket.on('error', (error) => {
    console.error('[Test] Error:', error);
});

socket.on('disconnect', () => {
    console.log('[Test] Disconnected from server');
});
