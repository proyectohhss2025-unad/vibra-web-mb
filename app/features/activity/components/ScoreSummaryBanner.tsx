import React from 'react';
import { Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface ScoreSummaryBannerProps {
  currentScore: number;
  maxScore: number;
  progressPercent: number;
  nextGameName?: string;
  nextGamePoints?: number;
}

const ScoreSummaryBanner: React.FC<ScoreSummaryBannerProps> = ({
  currentScore,
  maxScore,
  progressPercent,
  nextGameName,
  nextGamePoints,
}) => {
  const tailwind = useTailwind();

  const barColor = progressPercent >= 80 ? '#22c55e' : progressPercent >= 50 ? '#6366f1' : '#f59e0b';

  return (
    <View style={tailwind('mx-2 mb-3 p-3 bg-white/90 rounded-xl shadow-sm border border-indigo-100')}>
      {/* Fila superior: puntaje */}
      <View style={tailwind('flex-row justify-between items-center mb-2')}>
        <View style={tailwind('flex-row items-center')}>
          <Text style={tailwind('text-base')}>🏆</Text>
          <Text style={tailwind('ml-1 text-sm font-bold text-gray-800')}>
            {currentScore} / {maxScore} pts
          </Text>
        </View>
        <Text style={tailwind(`text-xs font-semibold ${progressPercent >= 80 ? 'text-green-600' : progressPercent >= 50 ? 'text-indigo-600' : 'text-yellow-600'}`)}>
          {progressPercent}%
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={tailwind('h-2 bg-gray-200 rounded-full overflow-hidden mb-2')}>
        <View
          style={{
            width: `${Math.min(100, progressPercent)}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Próximo juego */}
      {nextGameName && (
        <Text style={tailwind('text-xs text-gray-500')}>
          Próximo: {nextGameName} {nextGamePoints ? `(+${nextGamePoints} pts)` : ''}
        </Text>
      )}
    </View>
  );
};

export default ScoreSummaryBanner;
