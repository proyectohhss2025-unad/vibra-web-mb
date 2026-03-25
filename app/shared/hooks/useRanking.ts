import { RankingEntry } from '@/shared/types/ranking';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useRanking = () => {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [socket] = useState(() => io('http:localhost:4000/rankings'));

    useEffect(() => {
        socket.on('rankingsUpdate', setRankings);
        socket.on('historicalRankings', () => { }/* handleHistoricalData*/);

        socket.emit('joinRankingRoom');

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