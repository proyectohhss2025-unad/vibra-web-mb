import React, { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useParticipant from '@/context/ParticipantContext';
import useAuthContext from '@/context/AuthContext';
import FontSizeControl from '../../profile/components/FontSizeControl';
import config from '../../../../config/env.json';

const API_BASE = config.development.apiBaseUrl;
const LEVEL_EMOJIS: Record<string, string> = {
  bronce: '🥉',
  plata: '🥈',
  oro: '🥇',
  platino: '💎',
  diamante: '👑',
};

/**
 * Resuelve la URL completa del avatar.
 */
function resolveAvatarUrl(avatar: string | undefined | null): string | null {
  if (!avatar) return null;
  const isFileId = /^[a-f0-9]{24}$/i.test(avatar);
  if (isFileId) {
    return `${API_BASE}/api/users/avatar/stream/${avatar}`;
  }
  return `${API_BASE}/avatars/${avatar}`;
}

interface ProfileHeaderProps {
  onEditPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onEditPress }) => {
  const tailwind = useTailwind();
  const { participant } = useParticipant();
  const { user, logout } = useAuthContext();

  const displayName = participant?.nickname || 'Participante';
  const levelEmoji = LEVEL_EMOJIS[participant?.level || 'bronce'] || '🥉';
  const avatarUrl = useMemo(() => resolveAvatarUrl(user?.avatar || participant?.avatar), [user?.avatar, participant?.avatar]);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={tailwind('items-center py-6 px-4')}>
      {/* Avatar + Badge editar */}
      <View style={tailwind('relative mb-3')}>
        <View style={tailwind('w-20 h-20 rounded-full bg-indigo-100 items-center justify-center')}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <Text style={tailwind('text-3xl')}>{levelEmoji}</Text>
          )}
        </View>
        {onEditPress && (
          <TouchableOpacity
            onPress={onEditPress}
            style={tailwind(
              'absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full items-center justify-center border-2 border-white',
            )}
          >
            <Text style={tailwind('text-white text-sm font-bold')}>✏️</Text>
          </TouchableOpacity>
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

      {/* Control de tamaño de fuente (accesibilidad) */}
      <FontSizeControl />
    </View>
  );
};

export default ProfileHeader;
