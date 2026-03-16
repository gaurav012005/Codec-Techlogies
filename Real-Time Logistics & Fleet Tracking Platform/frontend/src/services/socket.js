import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
        });
        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default connectSocket;
