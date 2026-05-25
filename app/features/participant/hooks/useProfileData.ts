import useParticipant from '@/context/ParticipantContext';
import useRanking from '@/shared/hooks/useRanking';
import api from '@/shared/services/api/api';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export interface ActivityHistoryEntry {
  date: string;
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  level: string;
  points: number;
  avatar?: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  totalCount: number;
}

const useProfileData = () => {
  const { participant, isLoading: participantLoading } = useParticipant();
  const { rankings: wsRankings } = useRanking();

  // Historial de actividades
  const {
    data: activityHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery<{ history: ActivityHistoryEntry[] }>({
    queryKey: ['activity-history', participant?._id],
    queryFn: async () => {
      if (!participant?._id) return { history: [] };
      const response = await api.get(`/api/participants/${participant._id}/activity-history?days=30`);
      return response.data ?? response;
    },
    enabled: !!participant?._id,
    staleTime: 1000 * 60 * 2,
  });

  // Leaderboard (REST fallback)
  const {
    data: lbData,
    isLoading: lbLoading,
    refetch: refetchLeaderboard,
  } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', participant?.currentCourse],
    queryFn: async () => {
      const courseParam = participant?.currentCourse
        ? `?courseId=${participant.currentCourse}&limit=20`
        : '?limit=20';
      const response = await api.get(`/api/participants/leaderboard${courseParam}`);
      return response.data ?? response;
    },
    enabled: !!participant?._id,
    staleTime: 1000 * 60 * 1,
  });

  // Combinar WebSocket + REST para leaderboard
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    if (wsRankings && wsRankings.length > 0) {
      return wsRankings as LeaderboardEntry[];
    }
    return lbData?.leaderboard ?? [];
  }, [wsRankings, lbData]);

  const leaderboardTotal = lbData?.totalCount ?? 0;

  const isRefreshing = participantLoading || historyLoading || lbLoading;

  const refreshAll = useCallback(() => {
    refetchHistory();
    refetchLeaderboard();
  }, [refetchHistory, refetchLeaderboard]);

  // Calcular progreso del nivel
  const levelProgress = useMemo(() => {
    if (!participant) return { progress: 0, pointsToNext: 0, nextLevel: '' };

    const points = participant.points;
    const level = participant.level;

    const thresholds: Record<string, { min: number; max: number; next: string }> = {
      bronce: { min: 0, max: 99, next: 'plata' },
      plata: { min: 100, max: 299, next: 'oro' },
      oro: { min: 300, max: 599, next: 'platino' },
      platino: { min: 600, max: 999, next: 'diamante' },
      diamante: { min: 1000, max: Infinity, next: '' },
    };

    const t = thresholds[level];
    if (!t || level === 'diamante') {
      return { progress: 100, pointsToNext: 0, nextLevel: '' };
    }

    const progress = ((points - t.min) / (t.max - t.min)) * 100;
    const pointsToNext = t.max - points + 1;

    return {
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNext: Math.max(0, pointsToNext),
      nextLevel: t.next,
    };
  }, [participant]);

  return {
    participant,
    activityHistory: activityHistory?.history ?? [],
    leaderboard,
    leaderboardTotal,
    levelProgress,
    isRefreshing,
    refreshAll,
  };
};

export default useProfileData;
