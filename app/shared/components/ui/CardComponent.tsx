import useUser from '@/context/UserContext';
import useParticipant from '@/context/ParticipantContext';
import ActivityHistoryList from '@/features/activity/screens/ActivityHistoryList';
import useCurrentDate from '@/shared/hooks/currentDate';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import ProgressBarVibra from './ProgressBar';

const LEVEL_EMOJIS: Record<string, string> = {
  bronce: '🥉',
  plata: '🥈',
  oro: '🥇',
  platino: '💎',
  diamante: '👑',
};

const CardComponent = ({ emotion }: any) => {
  const { user } = useUser();
  const { participant } = useParticipant();
  const tailwind = useTailwind();
  const currentDate = useCurrentDate();
  const [historyActivate, setHistoryActivate] = React.useState(false);

  const displayName = participant?.nickname || user?.username || 'participante';
  const levelEmoji = LEVEL_EMOJIS[participant?.level || 'bronce'] || '🥉';

  return (
    <View style={tailwind('w-full p-2 bg-white rounded-lg shadow-sm dark:bg-white')}>
      {!historyActivate && <>
        <View style={{ alignItems: 'center', padding: 10 }}>
          <Text style={tailwind('text-xl font-bold text-gray-600 mb-4')}>
            {currentDate}
          </Text>
        </View>

        {/* ─── Tarjeta de progreso del participante ─── */}
        <View style={tailwind('mx-4 mb-4 p-4 bg-indigo-50 rounded-xl')}>
          <View style={tailwind('flex-row justify-between items-center')}>
            <View style={tailwind('flex-1')}>
              <Text style={tailwind('text-lg font-bold text-gray-800')}>
                ¡Hola {displayName}! {levelEmoji}
              </Text>
              <Text style={tailwind('text-sm text-gray-500 mt-1')}>
                Nivel {participant?.level || 'bronce'} · {participant?.points || 0} pts
              </Text>
            </View>
            <View style={tailwind('items-center')}>
              <Text style={tailwind('text-2xl font-bold text-indigo-600')}>
                {participant?.currentStreak || 0}
              </Text>
              <Text style={tailwind('text-xs text-gray-500')}>días seguidos</Text>
            </View>
          </View>
          {participant && (
            <View style={tailwind('flex-row justify-between mt-3 pt-3 border-t border-indigo-200')}>
              <View style={tailwind('items-center flex-1')}>
                <Text style={tailwind('font-bold text-indigo-600')}>{participant.totalActivitiesCompleted}</Text>
                <Text style={tailwind('text-xs text-gray-500')}>Actividades</Text>
              </View>
              <View style={tailwind('items-center flex-1')}>
                <Text style={tailwind('font-bold text-indigo-600')}>{participant.maxStreak}</Text>
                <Text style={tailwind('text-xs text-gray-500')}>Récord</Text>
              </View>
              <View style={tailwind('items-center flex-1')}>
                <Text style={tailwind('font-bold text-indigo-600')}>{participant.level}</Text>
                <Text style={tailwind('text-xs text-gray-500')}>Nivel</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={tailwind('mb-3 font-normal text-lg text-gray-500 dark:text-gray-400 p-4')}>
          ¿Que tal tu dia! Enseñanos tus emociones y asi podemos ayudarte a equilibrarte.
        </Text>
        <ProgressBarVibra />
      </>
      }
    </View>
  );
};


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#EAEAEA',
    padding: 4,
    borderColor: 'transparent',
  },
  gameContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  box: {
    width: 50,
    height: 50,
    backgroundColor: 'tomato',
    borderRadius: 4,
  },
});

export default CardComponent;