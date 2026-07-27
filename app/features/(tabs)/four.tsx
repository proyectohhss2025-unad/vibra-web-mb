import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useParticipant from '@/context/ParticipantContext';
import ActivityChart from '../participant/components/ActivityChart';
import LeaderboardTable from '../participant/components/LeaderboardTable';
import LevelProgressBar from '../participant/components/LevelProgressBar';
import ProfileHeader from '../participant/components/ProfileHeader';
import StreakCalendar from '../participant/components/StreakCalendar';
import useProfileData from '../participant/_hooks/useProfileData';
import EditProfileModal from '../profile/components/EditProfileModal';

export default function TabFour() {
  const tailwind = useTailwind();
  const { participant } = useParticipant();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    activityHistory,
    leaderboard,
    leaderboardTotal,
    levelProgress,
    isRefreshing,
    refreshAll,
  } = useProfileData();

  // Extraer fechas con actividad para el calendario
  const activeDates = activityHistory
    .filter((h) => h.count > 0)
    .map((h) => h.date);

  const userId = participant?.userId || '';

  if (!participant) {
    return (
      <View style={tailwind('flex-1 items-center justify-center bg-gray-50')}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={tailwind('mt-4 text-gray-500')}>Cargando perfil...</Text>
      </View>
    );
  }

  const daysSinceLastActivity = participant.lastActivityDate
    ? Math.floor(
        (new Date().getTime() - new Date(participant.lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 999;

  return (
    <View style={tailwind('flex-1')}>
      <ScrollView
        style={tailwind('flex-1 bg-gray-50')}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />
        }
      >
        {/* Sección 1: Header */}
        <ProfileHeader onEditPress={() => setEditModalVisible(true)} />

        {/* Sección 2: Barra de progreso */}
        <LevelProgressBar
          progress={levelProgress.progress}
          pointsToNext={levelProgress.pointsToNext}
          nextLevel={levelProgress.nextLevel}
          currentLevel={participant.level}
          currentPoints={participant.points}
        />

        {/* Sección 3: Gráfico de actividades */}
        <ActivityChart history={activityHistory} isLoading={isRefreshing} />

        {/* Sección 4: Calendario de racha */}
        <StreakCalendar
          currentStreak={participant.currentStreak}
          maxStreak={participant.maxStreak}
          activityDates={activeDates}
        />

        {/* Sección 5: Leaderboard */}
        <LeaderboardTable
          leaderboard={leaderboard}
          totalCount={leaderboardTotal}
          currentUserId={userId}
          isLoading={isRefreshing}
        />

        {/* Espaciado inferior */}
        <View style={tailwind('h-8')} />
      </ScrollView>

      {/* Modal de edición de perfil (fuera del ScrollView) */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </View>
  );
}
