export interface HistoricalRanking {
    date: Date;
    rankings: RankingEntry[];
}

export interface LiveRankingUpdate {
    type: 'full' | 'partial';
    data: RankingEntry[] | Partial<RankingEntry>[];
}

export interface UserRank extends RankingEntry {
    completedActivities: number;
    averageScore: number;
}

interface RankingEntry {
    userId: string;
    nickname: string;
    level: string;
    points: number;
    avatar?: string;
    rank?: number;
}

export default RankingEntry;
