import { io } from 'socket.io-client';
import config from './config/env.json';

/**
 * Base URL for the API obtained from environment configuration
 * @constant {string}
 */
const apiBaseUrl = config.development.apiBaseUrl;

const socket = io(`${apiBaseUrl}`, {
    transports: ['websocket'],
});

export default socket;