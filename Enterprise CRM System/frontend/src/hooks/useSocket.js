import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const useSocket = () => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [viewers, setViewers] = useState({});
    const listenersRef = useRef(new Map());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: Infinity,
            timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (err) => {
            console.log('Socket connection error:', err.message);
        });

        // Presence updates
        socket.on('presence:update', (data) => {
            setOnlineUsers(data.onlineUsers || []);
        });

        // Typing indicators
        socket.on('typing:update', (data) => {
            const key = `${data.entity}:${data.entityId}`;
            setTypingUsers(prev => {
                const updated = { ...prev };
                if (data.isTyping) {
                    if (!updated[key]) updated[key] = [];
                    if (!updated[key].find(u => u.userId === data.userId)) {
                        updated[key] = [...updated[key], { userId: data.userId, userName: data.userName }];
                    }
                } else {
                    if (updated[key]) {
                        updated[key] = updated[key].filter(u => u.userId !== data.userId);
                        if (updated[key].length === 0) delete updated[key];
                    }
                }
                return updated;
            });
        });

        // Entity viewing
        socket.on('viewing:update', (data) => {
            const key = `${data.entity}:${data.entityId}`;
            setViewers(prev => ({ ...prev, [key]: data.viewers || [] }));
        });

        // Heartbeat
        const heartbeatInterval = setInterval(() => {
            if (socket.connected) socket.emit('heartbeat');
        }, 30000);

        return () => {
            clearInterval(heartbeatInterval);
            listenersRef.current.clear();
            socket.disconnect();
        };
    }, []);

    // Subscribe to events
    const subscribe = useCallback((event, callback) => {
        const socket = socketRef.current;
        if (!socket) return () => { };

        socket.on(event, callback);
        return () => socket.off(event, callback);
    }, []);

    // Emit events
    const emit = useCallback((event, data) => {
        const socket = socketRef.current;
        if (socket?.connected) socket.emit(event, data);
    }, []);

    // Typing helpers
    const startTyping = useCallback((entity, entityId) => {
        emit('typing:start', { entity, entityId });
    }, [emit]);

    const stopTyping = useCallback((entity, entityId) => {
        emit('typing:stop', { entity, entityId });
    }, [emit]);

    // Viewing helpers
    const startViewing = useCallback((entity, entityId) => {
        emit('viewing:start', { entity, entityId });
    }, [emit]);

    const stopViewing = useCallback((entity, entityId) => {
        emit('viewing:stop', { entity, entityId });
    }, [emit]);

    // Get typing users for a specific entity
    const getTypingUsers = useCallback((entity, entityId) => {
        return typingUsers[`${entity}:${entityId}`] || [];
    }, [typingUsers]);

    // Get viewers for a specific entity
    const getViewers = useCallback((entity, entityId) => {
        return viewers[`${entity}:${entityId}`] || [];
    }, [viewers]);

    return {
        isConnected,
        onlineUsers,
        subscribe,
        emit,
        startTyping,
        stopTyping,
        startViewing,
        stopViewing,
        getTypingUsers,
        getViewers,
    };
};

export default useSocket;
