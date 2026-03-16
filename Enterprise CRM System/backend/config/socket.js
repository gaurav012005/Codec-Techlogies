const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io = null;
const onlineUsers = new Map(); // orgId -> Set of {userId, socketId, name}

const configureSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 30000,
    });

    // JWT Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            socket.organizationId = decoded.organizationId;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const orgRoom = `org:${socket.organizationId}`;
        const userId = socket.user.id || socket.user._id;

        // Join organization room (tenant isolation)
        socket.join(orgRoom);
        socket.join(`user:${userId}`);

        // Track online user
        if (!onlineUsers.has(socket.organizationId)) {
            onlineUsers.set(socket.organizationId, new Map());
        }
        const orgUsers = onlineUsers.get(socket.organizationId);
        orgUsers.set(userId, {
            userId,
            socketId: socket.id,
            name: socket.user.name || 'User',
            connectedAt: new Date(),
        });

        // Broadcast updated online users list
        io.to(orgRoom).emit('presence:update', {
            onlineUsers: Array.from(orgUsers.values()),
            count: orgUsers.size,
        });

        logger.info(`Socket connected: ${socket.user.name} (${userId}) in org ${socket.organizationId}`);

        // ─── Heartbeat ─────────────────────────
        socket.on('heartbeat', () => {
            socket.emit('heartbeat:ack', { timestamp: Date.now() });
        });

        // ─── Typing Indicators ─────────────────
        socket.on('typing:start', (data) => {
            socket.to(orgRoom).emit('typing:update', {
                userId,
                userName: socket.user.name,
                entity: data.entity,
                entityId: data.entityId,
                isTyping: true,
            });
        });

        socket.on('typing:stop', (data) => {
            socket.to(orgRoom).emit('typing:update', {
                userId,
                userName: socket.user.name,
                entity: data.entity,
                entityId: data.entityId,
                isTyping: false,
            });
        });

        // ─── Entity Viewing ─────────────────
        socket.on('viewing:start', (data) => {
            const viewRoom = `view:${data.entity}:${data.entityId}`;
            socket.join(viewRoom);
            io.to(viewRoom).emit('viewing:update', {
                entity: data.entity,
                entityId: data.entityId,
                viewers: getViewers(viewRoom),
            });
        });

        socket.on('viewing:stop', (data) => {
            const viewRoom = `view:${data.entity}:${data.entityId}`;
            socket.leave(viewRoom);
            io.to(viewRoom).emit('viewing:update', {
                entity: data.entity,
                entityId: data.entityId,
                viewers: getViewers(viewRoom),
            });
        });

        // ─── Disconnect ─────────────────
        socket.on('disconnect', () => {
            if (orgUsers) {
                orgUsers.delete(userId);
                if (orgUsers.size === 0) onlineUsers.delete(socket.organizationId);
            }

            io.to(orgRoom).emit('presence:update', {
                onlineUsers: orgUsers ? Array.from(orgUsers.values()) : [],
                count: orgUsers ? orgUsers.size : 0,
            });

            logger.info(`Socket disconnected: ${socket.user.name} (${userId})`);
        });
    });

    return io;
};

// Helper to count room viewers
const getViewers = (room) => {
    if (!io) return [];
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) return [];
    const viewers = [];
    roomSockets.forEach(socketId => {
        const s = io.sockets.sockets.get(socketId);
        if (s && s.user) {
            viewers.push({ userId: s.user.id || s.user._id, name: s.user.name });
        }
    });
    return viewers;
};

// ─── Broadcast Utilities ─────────────────

const emitToOrg = (organizationId, event, data) => {
    if (!io) return;
    io.to(`org:${organizationId}`).emit(event, data);
};

const emitToUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
};

const emitDealUpdate = (organizationId, type, deal) => {
    emitToOrg(organizationId, `deal:${type}`, deal);
};

const emitNotification = (userId, notification) => {
    emitToUser(userId, 'notification:new', notification);
};

const emitDashboardUpdate = (organizationId, data) => {
    emitToOrg(organizationId, 'dashboard:update', data);
};

const getIO = () => io;
const getOnlineUsers = (organizationId) => {
    const orgUsers = onlineUsers.get(organizationId);
    return orgUsers ? Array.from(orgUsers.values()) : [];
};

module.exports = {
    configureSocket,
    getIO,
    emitToOrg,
    emitToUser,
    emitDealUpdate,
    emitNotification,
    emitDashboardUpdate,
    getOnlineUsers,
};
