import RankingEntry from '@shared/types/ranking';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import config from '../../../config/env.json';

const API_BASE = config.development.apiBaseUrl; // http://localhost:4000

const useRanking = () => {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [socket] = useState(() => {
        const socketUrl = `${API_BASE}/rankings`;
        console.log('[useRanking] Connecting to:', socketUrl);
        return io(socketUrl, { transports: ['polling', 'websocket'] });
    });

    useEffect(() => {
        socket.on('rankingsUpdate', setRankings);
        socket.on('historicalRankings', () => { }/* handleHistoricalData*/);
        socket.on('connect_error', (err: any) => {
            console.warn('[useRanking] Connection error:', err.message);
        });
        socket.on('connect', () => {
            console.log('[useRanking] Connected successfully');
            socket.emit('joinRankingRoom');
        });

        // Si ya está conectado, emitir directamente
        if (socket.connected) {
            socket.emit('joinRankingRoom');
        }

        return () => {
            socket.disconnect();
        };
    }, []);

    const getUserPosition = (userId: string) => {
        socket.emit('requestUserPosition', userId);
    };

    return { rankings, getUserPosition };
};

export default useRanking;