import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import type { LeaderboardEntry } from '../hooks/useProfileData';

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  totalCount: number;
  currentUserId?: string;
  isLoading: boolean;
}

const LEVEL_BADGE_COLORS: Record<string, string> = {
  bronce: 'bg-orange-100 text-orange-800',
  plata: 'bg-gray-100 text-gray-800',
  oro: 'bg-yellow-100 text-yellow-800',
  platino: 'bg-blue-100 text-blue-800',
  diamante: 'bg-purple-100 text-purple-800',
};

const TOP_MEDALS = ['🥇', '🥈', '🥉'];

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  leaderboard,
  totalCount,
  currentUserId,
  isLoading,
}) => {
  const tailwind = useTailwind();

  if (isLoading) {
    return (
      <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm items-center')}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm')}>
        <Text style={tailwind('text-sm font-semibold text-gray-600 mb-2')}>
          🏆 Clasificación
        </Text>
        <Text style={tailwind('text-center text-gray-400 text-sm py-4')}>
          No hay participantes en la clasificación
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.userId === currentUserId;
    const badgeColor = LEVEL_BADGE_COLORS[item.level] || 'bg-gray-100 text-gray-800';
    const rankDisplay = item.rank <= 3 ? TOP_MEDALS[item.rank - 1] : `#${item.rank}`;

    return (
      <View
        style={[
          tailwind('flex-row items-center py-3 px-2 rounded-lg'),
          isMe ? tailwind('bg-indigo-50') : tailwind('bg-white'),
        ]}
      >
        {/* Posición */}
        <View style={tailwind('w-10 items-center')}>
          <Text style={tailwind('text-base font-bold text-gray-600')}>
            {rankDisplay}
          </Text>
        </View>

        {/* Avatar/Nickname */}
        <View style={tailwind('flex-1 flex-row items-center')}>
          <View style={tailwind('w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2')}>
            <Text style={tailwind('text-sm')}>
              {item.avatar ? '👤' : item.nickname.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={tailwind('flex-1')}>
            <Text style={[tailwind('text-sm font-medium'), isMe ? tailwind('text-indigo-700') : tailwind('text-gray-800')]}>
              {item.nickname}
              {isMe ? ' (Tú)' : ''}
            </Text>
          </View>
        </View>

        {/* Nivel badge */}
        <View style={tailwind('mr-3')}>
          <Text style={tailwind(`text-xs px-2 py-1 rounded-full capitalize ${badgeColor || ''}`)}>
            {item.level}
          </Text>
        </View>

        {/* Puntos */}
        <Text style={tailwind('text-sm font-bold text-gray-700 w-16 text-right')}>
          {item.points}
        </Text>
      </View>
    );
  };

  return (
    <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm')}>
      <View style={tailwind('flex-row justify-between items-center mb-3')}>
        <Text style={tailwind('text-sm font-semibold text-gray-600')}>
          🏆 Clasificación
        </Text>
        <Text style={tailwind('text-xs text-gray-400')}>
          {totalCount} participantes
        </Text>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      />
    </View>
  );
};

export default LeaderboardTable;
