import RankingEntry from '@shared/types/ranking';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';

const useRanking = () => {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [socket] = useState(() => {
        console.log('[useRanking] Connecting to:', SOCKET_URL);
        return io(SOCKET_URL, { transports: ['polling', 'websocket'] });
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