import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';

interface StatsBarProps {
  disponibles: number;
  enProgreso: number;
  completados: number;
  color: string;
}

const statsConfig = [
  { key: 'disponibles', label: 'Disponibles', icon: 'list-alt' as const, color: 'blue' },
  { key: 'enProgreso', label: 'En Progreso', icon: 'hourglass-half' as const, color: 'yellow' },
  { key: 'completados', label: 'Completados', icon: 'check-circle' as const, color: 'green' },
];

const StatsBar = ({ disponibles, enProgreso, completados, color }: StatsBarProps) => {
  const tailwind = useTailwind();
  const values = { disponibles, enProgreso, completados };

  return (
    <View style={tailwind('flex-row gap-2 mb-4')}>
      {statsConfig.map((stat) => {
        const bgMap: Record<string, string> = {
          blue: 'bg-blue-500',
          yellow: 'bg-yellow-500',
          green: 'bg-green-500',
        };
        const textMap: Record<string, string> = {
          blue: 'text-blue-100',
          yellow: 'text-yellow-100',
          green: 'text-green-100',
        };
        return (
          <View
            key={stat.key}
            style={[tailwind(`${bgMap[stat.color]} rounded-xl p-3 items-center flex-1`), styles.card]}
          >
            <MaterialIcons name={stat.icon} size={18} color="rgba(255,255,255,0.8)" />
            <Text style={tailwind('text-2xl font-bold text-white mt-1')}>{values[stat.key as keyof typeof values]}</Text>
            <Text style={tailwind(`text-xs ${textMap[stat.color]} mt-0.5`)}>{stat.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
};

export default StatsBar;
