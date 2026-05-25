import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import TamaguiButton from '@/shared/components/ui/tamagui/TamaguiButton';
import type { GameStatus } from '../hooks/useScoreTracker';

interface ActivityCompleteSummaryProps {
  visible: boolean;
  currentScore: number;
  maxScore: number;
  gamesStatus: GameStatus[];
  currentStreak: number;
  maxStreak: number;
  bonusPoints: number;
  onClose: () => void;
}

const ActivityCompleteSummary: React.FC<ActivityCompleteSummaryProps> = ({
  visible,
  currentScore,
  maxScore,
  gamesStatus,
  currentStreak,
  maxStreak,
  bonusPoints,
  onClose,
}) => {
  const tailwind = useTailwind();
  const totalWithBonus = currentScore + bonusPoints;
  const percent = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={tailwind('flex-1 justify-center items-center bg-black/50')}>
        <View style={tailwind('w-11/12 max-h-[80%] bg-white rounded-2xl p-6')}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={tailwind('items-center mb-4')}>
              <Text style={tailwind('text-4xl mb-2')}>🎉</Text>
              <Text style={tailwind('text-xl font-bold text-gray-800')}>
                ¡Actividad Diaria Completada!
              </Text>
            </View>

            {/* Puntaje total */}
            <View style={tailwind('bg-indigo-50 rounded-xl p-4 mb-4 items-center')}>
              <Text style={tailwind('text-3xl font-bold text-indigo-600')}>
                {totalWithBonus} / {maxScore} pts
              </Text>
              <Text style={tailwind('text-sm text-gray-500 mt-1')}>
                {percent}% de la meta
              </Text>
            </View>

            {/* Desglose por juego */}
            <Text style={tailwind('text-sm font-semibold text-gray-600 mb-2')}>
              📋 Desglose:
            </Text>
            {gamesStatus.map((game, i) => (
              <View
                key={i}
                style={tailwind(
                  'flex-row justify-between items-center py-2 px-3 rounded-lg mb-1',
                  game.completed ? 'bg-green-50' : 'bg-gray-50',
                )}
              >
                <View style={tailwind('flex-row items-center flex-1')}>
                  <Text style={tailwind('mr-2')}>{game.completed ? '✅' : '🔲'}</Text>
                  <Text style={tailwind('text-sm', game.completed ? 'text-gray-800' : 'text-gray-400')}>
                    {game.name}
                  </Text>
                </View>
                <Text style={tailwind('text-sm font-medium', game.completed ? 'text-green-700' : 'text-gray-400')}>
                  {game.earnedPoints}/{game.maxPoints} pts
                </Text>
              </View>
            ))}

            {/* Bonus */}
            {bonusPoints > 0 && (
              <View style={tailwind('bg-yellow-50 rounded-xl p-3 mt-3 flex-row justify-between items-center')}>
                <Text style={tailwind('text-sm font-medium text-yellow-700')}>
                  🎁 Bonus por completar
                </Text>
                <Text style={tailwind('text-sm font-bold text-yellow-700')}>
                  +{bonusPoints} pts
                </Text>
              </View>
            )}

            {/* Racha */}
            <View style={tailwind('flex-row justify-between mt-4 p-3 bg-orange-50 rounded-xl')}>
              <Text style={tailwind('text-sm text-orange-700')}>
                🔥 Racha actual: <Text style={tailwind('font-bold')}>{currentStreak}</Text> días
              </Text>
              <Text style={tailwind('text-sm text-orange-700')}>
                Récord: <Text style={tailwind('font-bold')}>{maxStreak}</Text> días
              </Text>
            </View>
          </ScrollView>

          {/* Botón cerrar */}
          <TamaguiButton
            title="Ir al inicio"
            variantColor="blue"
            onPress={onClose}
            fullWidth
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ActivityCompleteSummary;
