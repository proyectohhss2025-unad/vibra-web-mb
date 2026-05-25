import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';
import api, { ActivityService, RankingApi } from '@/shared/services/api/api';
import { getSafeKeyObjectFromStorage } from '@/shared/utils/safe-token-storage';

// Types based on API response
interface Emotion {
    _id: string;
    id: string;
    name: string;
    orientationNote: string;
    description: string;
    icono: string;
    percentNote: number;
}

interface Resource {
    type: string;
    _id: string;
    url: string;
    duration: number;
    metadata: {
        author: string;
        language: string;
    };
}

interface Question {
    type: string;
    _id: string;
    id: string;
    questionText: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
}

interface Activity {
    type: string;
    _id: string;
    id: string;
    emotion: Emotion;
    title: string;
    description: string;
    resources: Resource[];
    questions: Question[];
    difficulty: number;
    isActive: boolean;
    schedule: {
        date: string;
        weekNumber: number;
        year: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface ChallengeStats {
    disponibles: number;
    enProgreso: number;
    completados: number;
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
    const [stats, setStats] = useState<ChallengeStats>({ disponibles: 0, enProgreso: 0, completados: 0 });
    const [ranking, setRanking] = useState<RankingItem[]>([]);

    const getUserIdFromStorage = async (): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return getSafeKeyObjectFromStorage('userId');
        } else {
            const AsyncStorage = await import('@react-native-async-storage/async-storage');
            return AsyncStorage.getItem('userId');
        }
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
            console.log('Loading challenges for user:', userId);
            
            // Cargar actividades y datos del participante en paralelo
            const [response, participantRes] = await Promise.all([
                ActivityService.getChallenges(userId, 1, 20),
                api.get(`/api/participants/by-user/${userId}`).then(r => r.data).catch(() => null),
            ]);
            
            const courseId = participantRes?.currentCourse || null;
            console.log('Challenges response:', response);
            
            // API returns { data: [...], total, page, limit } - extract data array
            const activitiesData = Array.isArray(response) 
                ? response 
                : (response?.data || response?.docs || []);
            
            // Filter only 'reto' type activities
            const retoActivities = (activitiesData as Activity[]).filter(
                (activity: Activity) => activity.type === 'reto'
            );
            console.log('Filtered reto activities:', retoActivities.length);
            
            setChallenges(retoActivities);
            
            // Stats reales: todos son "disponibles", los completados se toman del participante
            const completedCount = participantRes?.totalActivitiesCompleted || 0;
            setStats({
                disponibles: retoActivities.length,
                enProgreso: Math.max(0, retoActivities.length - completedCount),
                completados: Math.min(completedCount, retoActivities.length),
            });
            
            // Ranking real desde la API
            if (courseId) {
                try {
                    const rankingData = await RankingApi.getByCourse(courseId, 10);
                    setRanking((rankingData?.data || []).map((item: any, index: number) => ({
                        userId: item.userId,
                        nickname: item.nickname,
                        points: item.points,
                        position: item.position || index + 1,
                        level: item.level,
                        courseName: item.courseName,
                        institutionName: item.institutionName,
                    })));
                } catch (err) {
                    console.error('Error loading ranking:', err);
                    setRanking([]);
                }
            } else {
                try {
                    const rankingData = await RankingApi.getGeneral(10);
                    setRanking((rankingData?.data || []).map((item: any, index: number) => ({
                        userId: item.userId,
                        nickname: item.nickname,
                        points: item.points,
                        position: item.position || index + 1,
                        level: item.level,
                        courseName: item.courseName,
                        institutionName: item.institutionName,
                    })));
                } catch (err) {
                    console.error('Error loading ranking:', err);
                    setRanking([]);
                }
            }
            
        } catch (err: any) {
            console.error('Error loading challenges:', err);
            setError(err?.message || 'Error al cargar retos. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChallenges();
    }, []);

    const getDifficultyStars = (difficulty: number) => {
        return '★'.repeat(difficulty) + '☆'.repeat(3 - difficulty);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
                <View style={tailwind('flex-1 justify-center items-center')}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={tailwind('mt-4 text-gray-500')}>Cargando retos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
                <View style={tailwind('flex-1 justify-center items-center')}>
                    <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                    <Text style={tailwind('mt-4 text-red-500 text-lg text-center px-4')}>{error}</Text>
                    <TouchableOpacity 
                        style={tailwind('mt-4 px-6 py-3 bg-blue-500 rounded-lg')} 
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                            loadChallenges();
                        }}
                    >
                        <Text style={tailwind('text-white font-semibold')}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
            <ScrollView contentContainerStyle={tailwind('py-4 px-4')} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={tailwind('flex-row items-center mb-6')}>
                    <MaterialIcons name="emoji-events" size={32} color="#F59E0B" />
                    <Text style={tailwind('text-2xl font-bold text-gray-800 ml-3')}>Retos</Text>
                </View>

                {/* Stats Cards */}
                <View style={tailwind('flex-row gap-3 mb-6')}>
                    <View style={[styles.statCard, tailwind('flex-1 bg-blue-500 rounded-xl p-4 items-center')]}>
                        <Text style={tailwind('text-3xl font-bold text-white')}>{stats.disponibles}</Text>
                        <Text style={tailwind('text-sm text-blue-100 mt-1')}>Disponibles</Text>
                    </View>
                    <View style={[styles.statCard, tailwind('flex-1 bg-yellow-500 rounded-xl p-4 items-center')]}>
                        <Text style={tailwind('text-3xl font-bold text-white')}>{stats.enProgreso}</Text>
                        <Text style={tailwind('text-sm text-yellow-100 mt-1')}>En Progreso</Text>
                    </View>
                    <View style={[styles.statCard, tailwind('flex-1 bg-green-500 rounded-xl p-4 items-center')]}>
                        <Text style={tailwind('text-3xl font-bold text-white')}>{stats.completados}</Text>
                        <Text style={tailwind('text-sm text-green-100 mt-1')}>Completados</Text>
                    </View>
                </View>

                {/* Challenges List */}
                {challenges.length === 0 ? (
                    <View style={tailwind('bg-white rounded-xl p-8 items-center shadow-sm')}>
                        <MaterialIcons name="sports-score" size={64} color="#9CA3AF" />
                        <Text style={tailwind('mt-4 text-gray-500 text-lg')}>No hay retos disponibles</Text>
                        <Text style={tailwind('mt-2 text-gray-400 text-sm')}>Vuelve más tarde para nuevos desafíos</Text>
                    </View>
                ) : (
                    challenges.map((challenge) => (
                        <View key={challenge._id} style={tailwind('bg-white rounded-xl p-4 mb-3 shadow-sm')}>
                            <View style={tailwind('flex-row items-start justify-between')}>
                                <View style={tailwind('flex-row items-center flex-1')}>
                                    <Text style={tailwind('text-2xl mr-3')}>{challenge.emotion?.icono || '🎯'}</Text>
                                    <View style={tailwind('flex-1')}>
                                        <Text style={tailwind('text-lg font-semibold text-gray-800')}>{challenge.title}</Text>
                                        <Text style={tailwind('text-sm text-yellow-500 mt-1')}>
                                            {getDifficultyStars(challenge.difficulty)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={tailwind('flex-row items-center mt-3 text-gray-500')}>
                                <MaterialIcons name="calendar-today" size={16} color="#9CA3AF" />
                                <Text style={tailwind('text-sm text-gray-500 ml-2')}>
                                    {formatDate(challenge.schedule?.date || challenge.createdAt)}
                                </Text>
                                <Text style={tailwind('mx-2 text-gray-300')}>•</Text>
                                <MaterialIcons name="help-outline" size={16} color="#9CA3AF" />
                                <Text style={tailwind('text-sm text-gray-500 ml-2')}>
                                    {challenge.questions.length} preguntas
                                </Text>
                            </View>

                            {/* Progress Bar (mock) */}
                            <View style={tailwind('mt-4')}>
                                <View style={tailwind('flex-row justify-between mb-1')}>
                                    <Text style={tailwind('text-xs text-gray-500')}>Progreso</Text>
                                    <Text style={tailwind('text-xs text-gray-500')}>0/{challenge.questions.length}</Text>
                                </View>
                                <View style={tailwind('h-2 bg-gray-200 rounded-full')}>
                                    <View style={[tailwind('h-2 bg-blue-500 rounded-full'), { width: '0%' }]} />
                                </View>
                            </View>

                            <TouchableOpacity style={tailwind('mt-4 bg-blue-500 rounded-lg py-3 items-center')}>
                                <Text style={tailwind('text-white font-semibold')}>Participar</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {/* Mini Ranking */}
                <View style={tailwind('bg-white rounded-xl p-4 mt-6 shadow-sm')}>
                    <View style={tailwind('flex-row items-center mb-4')}>
                        <MaterialIcons name="leaderboard" size={24} color="#F59E0B" />
                        <Text style={tailwind('text-lg font-semibold text-gray-800 ml-2')}>Top Participantes</Text>
                    </View>
                    
                    {ranking.map((item, index) => (
                        <View key={item.userId} style={tailwind('flex-row items-center py-2 border-b border-gray-100')}>
                            <View style={[
                                tailwind('w-8 h-8 rounded-full items-center justify-center mr-3'),
                                index === 0 && tailwind('bg-yellow-400'),
                                index === 1 && tailwind('bg-gray-300'),
                                index === 2 && tailwind('bg-amber-600'),
                                index > 2 && tailwind('bg-gray-200')
                            ]}>
                                <Text style={tailwind('text-sm font-bold text-white')}>{item.position || index + 1}</Text>
                            </View>
                            <View style={tailwind('flex-1')}>
                                <Text style={tailwind('text-gray-700 font-medium')}>{item.nickname}</Text>
                                {item.level && (
                                    <Text style={tailwind('text-xs text-gray-400')}>{item.level.charAt(0).toUpperCase() + item.level.slice(1)}</Text>
                                )}
                            </View>
                            <Text style={tailwind('text-green-600 font-semibold')}>{item.points} pts</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statCard: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});

export default ChallengesDashboard;