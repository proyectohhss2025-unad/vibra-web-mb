import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useParticipant from '@/context/ParticipantContext';
import useAuth from '@/shared/hooks/useAuth';

const LEVEL_EMOJIS: Record<string, string> = {
  bronce: '🥉',
  plata: '🥈',
  oro: '🥇',
  platino: '💎',
  diamante: '👑',
};

const ProfileHeader: React.FC = () => {
  const tailwind = useTailwind();
  const { participant, clearParticipant } = useParticipant();
  const { logout } = useAuth();

  const displayName = participant?.nickname || 'Participante';
  const levelEmoji = LEVEL_EMOJIS[participant?.level || 'bronce'] || '🥉';
  const avatarUrl = participant?.avatar;

  const handleLogout = async () => {
    await clearParticipant();
    logout();
  };

  return (
    <View style={tailwind('items-center py-6 px-4')}>
      {/* Avatar */}
      <View style={tailwind('w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-3')}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        ) : (
          <Text style={tailwind('text-3xl')}>{levelEmoji}</Text>
        )}
      </View>

      {/* Nickname */}
      <Text style={tailwind('text-xl font-bold text-gray-800')}>
        @{displayName}
      </Text>

      {/* Nivel + Puntos */}
      <View style={tailwind('flex-row items-center mt-1')}>
        <Text style={tailwind('text-lg mr-1')}>{levelEmoji}</Text>
        <Text style={tailwind('text-base font-semibold text-indigo-600 capitalize')}>
          Nivel {participant?.level || 'bronce'}
        </Text>
        <Text style={tailwind('text-base text-gray-500 ml-2')}>
          · {participant?.points || 0} pts
        </Text>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity
        onPress={handleLogout}
        style={tailwind('mt-4 px-6 py-2 bg-red-500 rounded-full')}
      >
        <Text style={tailwind('text-white text-sm font-medium')}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
