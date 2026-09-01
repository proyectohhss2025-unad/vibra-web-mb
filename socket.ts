import { io } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';

const socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
});

export default socket;