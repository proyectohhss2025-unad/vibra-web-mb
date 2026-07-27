import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';
import api, { ActivityService, RankingApi } from '@shared/services/api/api';
import { getSafeKeyObjectFromStorage } from '@shared/utils/safe-token-storage';
import StatsBar from '@shared/components/StatsBar';
import ActivityCard from '@shared/components/ActivityCard';
import MiniRanking from '@shared/components/MiniRanking';

interface Activity {
  type: string;
  _id: string;
  id: string;
  emotion: { icono: string; name: string };
  title: string;
  description: string;
  difficulty: number;
  questions: { length: number };
  schedule?: { date: string };
  createdAt: string;
}

interface RankingItem {
  userId: string;
  nickname: string;
  points: number;
  position: number;
  level?: string;
  courseName?: string;
  institutionName?: string;
}

const ChallengesDashboard = () => {
  const tailwind = useTailwind();
  const [challenges, setChallenges] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ disponibles: 0, enProgreso: 0, completados: 0 });
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<string, { completed: boolean; score: number }>>({});

  const getUserIdFromStorage = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return getSafeKeyObjectFromStorage('userId');
    }
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.getItem('userId');
  };

  const loadChallenges = async () => {
    try {
      const userId = await getUserIdFromStorage();
      if (!userId) {
        setLoading(false);
        setError('Usuario no disponible. Por favor, inicia sesión.');
        return;
      }
      setLoading(true);
      setError(null);

      const [response, participantRes] = await Promise.all([
        ActivityService.getChallenges(userId, 1, 20),
        api.get(`/api/participants/by-user/${userId}`).then(r => r.data).catch(() => null),
      ]);

      const courseId = participantRes?.currentCourse || null;
      const activitiesData = Array.isArray(response) ? response : (response?.data || response?.docs || []);
      const retoActivities = activitiesData.filter((a: Activity) => a.type === 'reto');
      setChallenges(retoActivities);

      const completedCount = participantRes?.totalActivitiesCompleted || 0;
      setStats({
        disponibles: retoActivities.length,
        enProgreso: Math.max(0, retoActivities.length - completedCount),
        completados: Math.min(completedCount, retoActivities.length),
      });

      const rankingSource = courseId
        ? RankingApi.getByCourse(courseId, 10)
        : RankingApi.getGeneral(10);
      const rankingData = await rankingSource;
      setRanking((rankingData?.data || []).map((item: any, index: number) => ({
        userId: item.userId,
        nickname: item.nickname,
        points: item.points,
        position: item.position || index + 1,
        level: item.level,
        courseName: item.courseName,
        institutionName: item.institutionName,
      })));
    } catch (err: any) {
      setError(err?.message || 'Error al cargar retos. Verifica tu conexión.');
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChallenges(); }, []);

  // Verificar qué retos ya completó el usuario
  useEffect(() => {
    const checkCompletions = async () => {
      if (challenges.length === 0) return;
      const userId = await getUserIdFromStorage();
      if (!userId) return;
      const map: Record<string, { completed: boolean; score: number }> = {};
      await Promise.all(challenges.map(async (ch) => {
        try {
          const result = await ActivityService.checkActivityResponse(ch._id, userId);
          if (result?.alreadyResponded) {
            map[ch._id] = { completed: true, score: result.score || 0 };
          }
        } catch { /* ignore */ }
      }));
      setCompletedMap(map);
    };
    checkCompletions();
  }, [challenges]);

  if (loading) {
    return (
      <SafeAreaView style={tailwind('flex-1 bg-gray-50')}>
        <View style={tailwind('flex-1 justify-center items-center')}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={tailwind('mt-3 text-gray-500')}>Cargando retos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tailwind('flex-1 bg-gray-50')}>
        <View style={tailwind('flex-1 justify-center items-center')}>
          <MaterialIcons name="error-outline" size={56} color="#EF4444" />
          <Text style={tailwind('mt-3 text-red-500 text-base text-center px-4')}>{error}</Text>
          <TouchableOpacity style={tailwind('mt-3 px-6 py-2.5 bg-blue-500 rounded-lg')} onPress={() => { setLoading(true); setError(null); loadChallenges(); }}>
            <Text style={tailwind('text-white font-semibold')}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tailwind('flex-1 bg-gray-50')}>
      <ScrollView contentContainerStyle={tailwind('py-3 px-3')} showsVerticalScrollIndicator={false}>
        <View style={tailwind('flex-row items-center mb-3')}>
          <MaterialIcons name="emoji-events" size={28} color="#F59E0B" />
          <Text style={tailwind('text-xl font-bold text-gray-800 ml-2')}>Retos</Text>
        </View>

        <StatsBar
          disponibles={stats.disponibles}
          enProgreso={stats.enProgreso}
          completados={stats.completados}
          color="blue"
        />

        {challenges.length === 0 ? (
          <View style={tailwind('bg-white rounded-xl p-6 items-center')}>
            <MaterialIcons name="sports-score" size={56} color="#9CA3AF" />
            <Text style={tailwind('mt-3 text-gray-500 text-base')}>No hay retos disponibles</Text>
            <Text style={tailwind('mt-1 text-gray-400 text-xs')}>Vuelve más tarde para nuevos desafíos</Text>
          </View>
        ) : (
          challenges.map((challenge) => (
            <ActivityCard
              key={challenge._id}
              activity={challenge as any}
              accentColor="bg-blue-500"
              onParticipate={() => {}}
              completed={completedMap[challenge._id]?.completed || false}
              completedScore={completedMap[challenge._id]?.score}
            />
          ))
        )}

        <MiniRanking items={ranking} accentColor="bg-yellow-500" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChallengesDashboard;
