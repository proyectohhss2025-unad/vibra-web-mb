import React from 'react';
import { Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface LevelProgressBarProps {
  progress: number;
  pointsToNext: number;
  nextLevel: string;
  currentLevel: string;
  currentPoints: number;
}

const LEVEL_COLORS: Record<string, string> = {
  bronce: '#CD7F32',
  plata: '#A0A0A0',
  oro: '#FFD700',
  platino: '#00BFFF',
  diamante: '#8A2BE2',
};

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  progress,
  pointsToNext,
  nextLevel,
  currentLevel,
  currentPoints,
}) => {
  const tailwind = useTailwind();
  const color = LEVEL_COLORS[currentLevel] || '#CD7F32';
  const isMaxLevel = currentLevel === 'diamante' || !nextLevel;

  return (
    <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm')}>
      <View style={tailwind('flex-row justify-between items-center mb-2')}>
        <Text style={tailwind('text-sm font-semibold text-gray-600 capitalize')}>
          Nivel {currentLevel}
        </Text>
        <Text style={tailwind('text-sm text-gray-500')}>
          {currentPoints} pts
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={tailwind('h-3 bg-gray-200 rounded-full overflow-hidden')}>
        <View
          style={{
            width: `${isMaxLevel ? 100 : Math.round(progress)}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Texto de progreso */}
      <Text style={tailwind('text-xs text-gray-500 mt-1 text-center')}>
        {isMaxLevel
          ? '¡Nivel máximo alcanzado! 🎉'
          : `${pointsToNext} pts para ${nextLevel}`}
      </Text>
    </View>
  );
};

export default LevelProgressBar;
