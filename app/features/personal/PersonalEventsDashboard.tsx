import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';
import api, { ActivityService, RankingApi } from '@shared/services/api/api';
import { getSafeKeyObjectFromStorage } from '@shared/utils/safe-token-storage';
import CalendarComponent from '@shared/components/ui/CalendarComponent';
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

const PersonalEventsDashboard = () => {
  const tailwind = useTailwind();
  const [events, setEvents] = useState<Activity[]>([]);
  const [allEvents, setAllEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ disponibles: 0, enProgreso: 0, completados: 0 });
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getUserIdFromStorage = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return getSafeKeyObjectFromStorage('userId');
    }
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.getItem('userId');
  };

  const filterEventsByDate = (eventsList: Activity[], date: string | null) => {
    if (!date) {
      setEvents(eventsList);
      return;
    }
    const filtered = eventsList.filter(event => {
      const eventDate = event.schedule?.date?.split('T')[0];
      return eventDate === date;
    });
    setEvents(filtered);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    filterEventsByDate(allEvents, date);
  };

  const loadEvents = async () => {
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
        ActivityService.getAvailableActivities(userId, 1, 50, 'evento_personal'),
        api.get(`/api/participants/by-user/${userId}`).then(r => r.data).catch(() => null),
      ]);

      // El backend ya filtra por type='evento_personal' (incluye las actividades
      // sin type, que son el default del schema) y excluye las respondidas —
      // GET /api/activities/available/:userId?type=evento_personal
      const activitiesData = Array.isArray(response) ? response : (response?.data || response?.docs || []);
      setAllEvents(activitiesData);
      filterEventsByDate(activitiesData, selectedDate);

      const completedCount = participantRes?.totalActivitiesCompleted || 0;
      setStats({
        disponibles: activitiesData.length,
        enProgreso: Math.max(0, activitiesData.length - completedCount),
        completados: Math.min(completedCount, activitiesData.length),
      });

      const courseId = participantRes?.currentCourse || null;
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
      setError(err?.message || 'Error al cargar eventos. Verifica tu conexión.');
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={tailwind('flex-1 bg-gray-50')}>
        <View style={tailwind('flex-1 justify-center items-center')}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={tailwind('mt-3 text-gray-500')}>Cargando eventos...</Text>
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
          <TouchableOpacity style={tailwind('mt-3 px-6 py-2.5 bg-blue-500 rounded-lg')} onPress={() => { setLoading(true); setError(null); loadEvents(); }}>
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
          <MaterialIcons name="event" size={28} color="#8B5CF6" />
          <Text style={tailwind('text-xl font-bold text-gray-800 ml-2')}>E-Personal</Text>
        </View>

        <View style={tailwind('mb-3')}>
          <CalendarComponent onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </View>

        <StatsBar
          disponibles={stats.disponibles}
          enProgreso={stats.enProgreso}
          completados={stats.completados}
          color="purple"
        />

        {events.length === 0 ? (
          <View style={tailwind('bg-white rounded-xl p-6 items-center')}>
            <MaterialIcons name="event-busy" size={56} color="#9CA3AF" />
            <Text style={tailwind('mt-3 text-gray-500 text-base')}>
              {selectedDate ? 'No hay eventos para esta fecha' : 'No hay eventos disponibles'}
            </Text>
            <Text style={tailwind('mt-1 text-gray-400 text-xs')}>
              {selectedDate ? 'Selecciona otra fecha o ver todos' : 'Vuelve más tarde para nuevos eventos'}
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <ActivityCard
              key={event._id}
              activity={event as any}
              accentColor="bg-purple-500"
              onParticipate={() => {}}
            />
          ))
        )}

        <MiniRanking items={ranking} accentColor="bg-purple-500" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalEventsDashboard;
