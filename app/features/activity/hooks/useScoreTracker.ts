import useActivityStore from '@/shared/store/activity.store';
import calculateScore from '@/shared/utils/score-utils';
import { useMemo } from 'react';

export interface GameStatus {
  type: string;
  name: string;
  maxPoints: number;
  earnedPoints: number;
  completed: boolean;
}

const GAME_MAX_POINTS: Record<string, number> = {
  Question: 100,
  WordSearch: 100,
  MatchingConcepts: 80,
  EmotionBox: 60,
  DiceGame: 120,
};

const GAME_LABELS: Record<string, string> = {
  Question: 'Preguntas',
  WordSearch: 'Sopa de Letras',
  MatchingConcepts: 'Emparejar Conceptos',
  EmotionBox: 'Caja de Emociones',
  DiceGame: 'Juego de Dados',
};

const useScoreTracker = (activity: any) => {
  const { responses, gameIndex, games, activityType } = useActivityStore();

  const currentScore = calculateScore(responses as any);

  const maxScore = useMemo(() => {
    const questionsCount = activity?.questions?.length || 0;
    const questionsMax = questionsCount * 100;

    const gamesMax = (games || []).reduce(
      (acc: number, g: any) => acc + (GAME_MAX_POINTS[g.type] || 100),
      0,
    );

    return questionsMax + gamesMax;
  }, [games, activity]);

  const gamesStatus = useMemo<GameStatus[]>(() => {
    const allGames = [
      ...(activity?.questions?.length
        ? [{ type: 'Question' as const, name: 'Preguntas' }]
        : []),
      ...(games || []),
    ];

    return allGames.map((g: any, i: number) => {
      const type = g.type || g;
      const completed = i < gameIndex;
      return {
        type,
        name: GAME_LABELS[type] || type,
        maxPoints: GAME_MAX_POINTS[type] || 100,
        earnedPoints: completed ? GAME_MAX_POINTS[type] || 100 : 0,
        completed,
      };
    });
  }, [games, gameIndex, activity]);

  const nextGame = useMemo<{ name: string; points: number } | null>(() => {
    const allGames = [
      ...(activity?.questions?.length ? [{ type: 'Question' }] : []),
      ...(games || []),
    ];
    const nextIdx = gameIndex + 1;
    if (nextIdx < allGames.length) {
      const next = allGames[nextIdx];
      const type = next.type;
      return {
        name: GAME_LABELS[type] || type,
        points: GAME_MAX_POINTS[type] || 100,
      };
    }
    return null;
  }, [games, gameIndex, activity]);

  const progressPercent = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  return { currentScore, maxScore, gamesStatus, nextGame, progressPercent };
};

export default useScoreTracker;
