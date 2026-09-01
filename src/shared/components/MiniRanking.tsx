import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';

interface RankingItem {
  userId: string;
  nickname: string;
  points: number;
  position: number;
  level?: string;
  courseName?: string;
  institutionName?: string;
}

interface MiniRankingProps {
  items: RankingItem[];
  accentColor: string;
}

const positionStyles = [
  'bg-yellow-400',
  'bg-gray-300',
  'bg-amber-600',
  'bg-gray-200',
];

const MiniRanking = ({ items, accentColor }: MiniRankingProps) => {
  const tailwind = useTailwind();

  if (items.length === 0) return null;

  const iconColor = accentColor === 'bg-purple-500' ? '#8B5CF6' : '#F59E0B';

  return (
    <View style={[tailwind('bg-white rounded-xl p-3 mt-4'), styles.card]}>
      <View style={tailwind('flex-row items-center mb-3')}>
        <MaterialIcons name="leaderboard" size={20} color={iconColor} />
        <Text style={tailwind('text-base font-semibold text-gray-800 ml-1.5')}>Top Participantes</Text>
      </View>

      {items.map((item, index) => (
        <View key={`${item.userId}-${index}`} style={tailwind('flex-row items-center py-1.5 border-b border-gray-100')}>
          <View style={[
            tailwind('w-7 h-7 rounded-full items-center justify-center mr-2'),
            tailwind(positionStyles[index] || positionStyles[3]),
          ]}>
            <Text style={tailwind('text-xs font-bold text-white')}>{item.position || index + 1}</Text>
          </View>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('text-sm text-gray-700 font-medium')} numberOfLines={1}>{item.nickname}</Text>
          </View>
          <Text style={tailwind('text-sm text-green-600 font-semibold')}>{item.points} pts</Text>
        </View>
      ))}
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

export default MiniRanking;
