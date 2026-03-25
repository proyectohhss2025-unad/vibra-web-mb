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
    score: number;
    username?: string;
    avatar?: string;
    position?: number;
    lastActivity?: Date;
}

export default RankingEntry;