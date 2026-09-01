import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';
import SearchInput from '@shared/components/ui/SearchInput';
import EmotionBadge from '../components/EmotionBadge';
import { ActivityService } from '@shared/services/api/api';
import { getSafeKeyObjectFromStorage } from '@shared/utils/safe-token-storage';

// Types based on API response
interface Emotion {
    _id: string;
    id: string;
    name: string;
    icono: string;
}

interface Activity {
    type: string;
    _id: string;
    id: string;
    emotion: Emotion;
    title: string;
    description: string;
    resources: any[];
    questions: any[];
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

interface HistoryStats {
    total: number;
    completadas: number;
    enProgreso: number;
}

const ActivityHistoryList = () => {
    const tailwind = useTailwind();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<HistoryStats>({ total: 0, completadas: 0, enProgreso: 0 });

    const getUserIdFromStorage = async (): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return getSafeKeyObjectFromStorage('userId');
        } else {
            const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
            return AsyncStorage.getItem('userId');
        }
    };

    const loadActivities = async () => {
        try {
            const userId = await getUserIdFromStorage();
            
            if (!userId) {
                setLoading(false);
                setError('Usuario no disponible. Por favor, inicia sesión.');
                return;
            }
            
            setLoading(true);
            setError(null);
            console.log('Loading all activities for user:', userId);
            
            const response = await ActivityService.getChallenges(userId, 1, 50);
            console.log('Activities response:', response);
            
            // API returns { data: [...], total, page, limit }
            const activitiesData = Array.isArray(response) 
                ? response 
                : (response?.data || response?.docs || []);
            
            console.log('Total activities loaded:', activitiesData.length);
            
            setActivities(activitiesData as Activity[]);
            setFilteredActivities(activitiesData as Activity[]);
            
            // Calculate stats (mock for now - based on activity count)
            const total = activitiesData.length;
            const completadas = Math.floor(total * 0.4);
            const enProgreso = Math.floor(total * 0.3);
            
            setStats({
                total,
                completadas,
                enProgreso: Math.max(0, total - completadas - enProgreso)
            });
            
        } catch (err: any) {
            console.error('Error loading activities:', err);
            setError(err?.message || 'Error al cargar actividades. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (results: Activity[]) => {
        setFilteredActivities(results);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reto': return 'Reto';
            case 'evento_personal': return 'Personal';
            case 'actividad_pares': return 'Pares';
            default: return type || 'Personal';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'reto': return '#F59E0B';
            case 'evento_personal': return '#8B5CF6';
            case 'actividad_pares': return '#10B981';
            default: return type ? '#6B7280' : '#8B5CF6';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    useEffect(() => {
        loadActivities();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
                <View style={tailwind('flex-1 justify-center items-center')}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={tailwind('mt-4 text-gray-500')}>Cargando historial...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
                <View style={tailwind('flex-1 justify-center items-center px-4')}>
                    <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                    <Text style={tailwind('mt-4 text-red-500 text-lg text-center')}>{error}</Text>
                    <TouchableOpacity 
                        style={tailwind('mt-4 px-6 py-3 bg-blue-500 rounded-lg')} 
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                            loadActivities();
                        }}
                    >
                        <Text style={tailwind('text-white font-semibold')}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderActivityItem = ({ item }: { item: Activity }) => {
        const activityType = item.type ?? 'evento_personal';
        return (
        <TouchableOpacity style={tailwind('bg-white rounded-xl p-4 mb-3 shadow-sm')}>
            <View style={tailwind('flex-row justify-between items-start mb-3')}>
                <View style={tailwind('flex-row items-center')}>
                    <EmotionBadge emotion={item.emotion?.name} />
                    <View style={tailwind('ml-3')}>
                        <Text style={tailwind('text-base font-semibold text-gray-800')}>{item.title}</Text>
                        <Text style={tailwind('text-sm text-gray-500')}>
                            {formatDate(item.schedule?.date || item.createdAt)}
                        </Text>
                    </View>
                </View>
                <View style={[tailwind('px-2 py-1 rounded-full'), { backgroundColor: getTypeColor(activityType) + '20' }]}>
                    <Text style={[tailwind('text-xs font-medium'), { color: getTypeColor(activityType) }]}>
                        {getTypeLabel(activityType)}
                    </Text>
                </View>
            </View>
            
            <View style={tailwind('flex-row items-center text-gray-500')}>
                <MaterialIcons name="play-circle-outline" size={16} color="#9CA3AF" />
                <Text style={tailwind('text-sm text-gray-500 ml-1')}>
                    {item.questions?.length || 0} preguntas
                </Text>
                <Text style={tailwind('mx-2 text-gray-300')}>•</Text>
                <MaterialIcons name="attach-file" size={16} color="#9CA3AF" />
                <Text style={tailwind('text-sm text-gray-500 ml-1')}>
                    {item.resources?.length || 0} recursos
                </Text>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, tailwind('flex-1 bg-gray-50')]}>
            {/* Header */}
            <View style={tailwind('px-4 py-3 flex-row items-center')}>
                <MaterialIcons name="history" size={28} color="#3B82F6" />
                <Text style={tailwind('text-xl font-bold text-gray-800 ml-3')}>Historial</Text>
            </View>

            {/* Stats Cards */}
            <View style={tailwind('flex-row gap-2 px-4 mb-3')}>
                <View style={[tailwind('flex-1 bg-blue-500 rounded-lg p-3 items-center')]}>
                    <Text style={tailwind('text-2xl font-bold text-white')}>{stats.total}</Text>
                    <Text style={tailwind('text-xs text-blue-100')}>Total</Text>
                </View>
                <View style={[tailwind('flex-1 bg-green-500 rounded-lg p-3 items-center')]}>
                    <Text style={tailwind('text-2xl font-bold text-white')}>{stats.completadas}</Text>
                    <Text style={tailwind('text-xs text-green-100')}>Completadas</Text>
                </View>
                <View style={[tailwind('flex-1 bg-yellow-500 rounded-lg p-3 items-center')]}>
                    <Text style={tailwind('text-2xl font-bold text-white')}>{stats.enProgreso}</Text>
                    <Text style={tailwind('text-xs text-yellow-100')}>En Progreso</Text>
                </View>
            </View>

            {/* Search */}
            <View style={tailwind('px-4 mb-3')}>
                <SearchInput
                    data={activities}
                    onSearch={handleSearch}
                    searchKey="title"
                    placeholder="Buscar actividad..."
                    containerStyle={{ backgroundColor: '#ffffff', borderRadius: 10 }}
                />
            </View>

            {/* List */}
            {filteredActivities.length === 0 ? (
                <View style={tailwind('flex-1 justify-center items-center px-4')}>
                    <MaterialIcons name="event-note" size={64} color="#9CA3AF" />
                    <Text style={tailwind('mt-4 text-gray-500 text-lg text-center')}>
                        No hay actividades en tu historial
                    </Text>
                    <Text style={tailwind('mt-2 text-gray-400 text-sm text-center')}>
                        Completa actividades para verlas aquí
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredActivities}
                    keyExtractor={item => item._id}
                    renderItem={renderActivityItem}
                    contentContainerStyle={tailwind('px-4 pb-4')}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ActivityHistoryList;