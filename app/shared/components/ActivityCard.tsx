import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';

interface Emotion {
  _id: string;
  id: string;
  name: string;
  orientationNote: string;
  description: string;
  icono: string;
  percentNote: number;
}

interface Activity {
  type: string;
  _id: string;
  id: string;
  emotion: Emotion;
  title: string;
  description: string;
  difficulty: number;
  questions: { length: number };
  schedule?: { date: string };
  createdAt: string;
}

interface ActivityCardProps {
  activity: Activity;
  onParticipate: () => void;
  accentColor: string;
  completed?: boolean;
  completedScore?: number;
}

const getDifficultyStars = (difficulty: number) => {
  return '★'.repeat(difficulty) + '☆'.repeat(3 - difficulty);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const ActivityCard = ({ activity, onParticipate, accentColor, completed, completedScore }: ActivityCardProps) => {
  const tailwind = useTailwind();

  return (
    <View style={[tailwind(`bg-white rounded-xl p-3 mb-3 ${completed ? 'opacity-80' : ''}`), styles.card]}>
      <View style={tailwind('flex-row items-center')}>
        <Text style={tailwind('text-2xl mr-2')}>{activity.emotion?.icono || '🎯'}</Text>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('text-base font-semibold text-gray-800')} numberOfLines={1}>
            {activity.title}
          </Text>
        </View>
        <Text style={tailwind('text-sm text-yellow-500 ml-2')}>
          {getDifficultyStars(activity.difficulty)}
        </Text>
      </View>

      <View style={tailwind('flex-row items-center mt-2')}>
        <MaterialIcons name="calendar-today" size={14} color="#9CA3AF" />
        <Text style={tailwind('text-xs text-gray-500 ml-1')}>
          {formatDate(activity.schedule?.date || activity.createdAt)}
        </Text>
        <Text style={tailwind('mx-1.5 text-gray-300')}>•</Text>
        <MaterialIcons name="help-outline" size={14} color="#9CA3AF" />
        <Text style={tailwind('text-xs text-gray-500 ml-1')}>
          {activity.questions.length} preguntas
        </Text>
      </View>

      {completed ? (
        <View style={tailwind('mt-3 bg-green-100 rounded-lg py-2 items-center flex-row justify-center')}>
          <MaterialIcons name="check-circle" size={16} color="#16a34a" />
          <Text style={tailwind('text-green-700 font-semibold text-sm ml-1')}>
            Completada {completedScore != null ? `· ${completedScore} pts` : ''}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[tailwind(`mt-3 ${accentColor} rounded-lg py-2 items-center`)]}
          onPress={onParticipate}
        >
          <Text style={tailwind('text-white font-semibold text-sm')}>Participar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
};

export default ActivityCard;
