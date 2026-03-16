// ============================================
// Server Entry Point — Feature 14: Socket.IO
// Online Examination & Proctoring Platform
// ============================================

const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`  → User ${userId} joined notification room`);
      }
    });

    // Leave room on disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Make io accessible from controllers via app.get('io')
  app.set('io', io);
  console.log('✅ Socket.IO initialized');
} catch (err) {
  console.warn('⚠️  Socket.IO not installed. Real-time notifications disabled.');
  console.warn('   Run: npm install socket.io');
}

// ─── Start Server ────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
});
