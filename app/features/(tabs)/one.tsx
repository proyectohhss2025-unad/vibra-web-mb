import useAuth from '@/shared/hooks/useAuth';
import useParticipant from '@/context/ParticipantContext';
import { ScrollView, StyleSheet, View, Text, Platform } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import CardComponent from '../../shared/components/ui/CardComponent';
import TamaguiButton from '@/shared/components/ui/tamagui/TamaguiButton';
import CardSlider from '../../shared/components/ui/CardSlider';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivityHistoryList from '../activity/screens/ActivityHistoryList';
import FloatButton from '@/shared/components/ui/animation/FloatButton';
import NoActivityState from '@/shared/components/common/NoActivityState';
import { ActivityService } from '@/shared/services/api/api';
import api from '@/shared/services/api/api';

export default function TabOne() {
    const tailwind = useTailwind();
    const { logout } = useAuth();
    const { refreshParticipant, clearParticipant } = useParticipant();
    const router = useRouter();
    const [historyActivate, setHistoryActivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [todayStatus, setTodayStatus] = useState<'loading' | 'active' | 'no_activity'>('loading');

    useEffect(() => {
        // Refrescar datos del participante desde API, o crearlo si no existe
        const ensureParticipant = async () => {
            try {
                await refreshParticipant();
            } catch {
                // Participante no existe — crearlo (caso "Mantener sesión iniciada")
                try {
                    let userId: string | null = null;
                    if (Platform.OS === 'web') {
                        userId = localStorage.getItem('userId');
                    } else {
                        userId = await AsyncStorage.getItem('userId');
                    }
                    if (userId) {
                        await api.post('/api/participants', { userId, nickname: 'participante' });
                        await refreshParticipant();
                    }
                } catch (createErr: any) {
                    console.warn('[TabOne] No se pudo crear participante:', createErr.message);
                }
            }
        };
        ensureParticipant();

        ActivityService.getDailyActivity()
            .then((data: any) => {
                setTodayStatus(data?.schedule?.status === 'active' ? 'active' : 'no_activity');
            })
            .catch(() => setTodayStatus('no_activity'));
    }, []);

    const handleCheckAgain = () => {
        setTodayStatus('loading');
        ActivityService.getDailyActivity()
            .then((data: any) => {
                setTodayStatus(data?.schedule?.status === 'active' ? 'active' : 'no_activity');
            })
            .catch(() => setTodayStatus('no_activity'));
    };

    return (
        <ScrollView style={[styles.scrollView, tailwind('bg-gray-50 p-4')]}>

            {todayStatus === 'no_activity' && (
                <NoActivityState variant="banner" onCheckAgain={handleCheckAgain} />
            )}

            {!historyActivate &&
                <CardComponent />
            }

            <CardSlider
                autoPlay={true}
                withContainerAutoplay={true}
                autoPlayInterval={5000} />

            {historyActivate && <>
                <Text style={tailwind('mb-3 font-normal text-lg text-gray-500 dark:text-gray-400 p-4')}>
                    Tu historial de emociones.
                </Text>
                <ActivityHistoryList />
            </>}
            {/*<FloatButton />
            <WelcomeScreen navigation={undefined} />
            <View style={{ flex: 1, paddingHorizontal: 20, top: 0 }}>
                <Text>Datos mockeados: {mockDashboardData.tabOne}</Text>
            <UploadFile />
                <ReproductorMedia />
                <View style={{ flex: 1, alignContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setAnimate(true)}>
                        <Animated.View style={[styles.box, { transform: [{ scale: escala }] }]} />
                    </TouchableOpacity>
                </View>
            </View>*/}
            <View style={tailwind('flex-row justify-between items-center mt-6 w-full px-2')}>
                <View style={tailwind('flex-1 mx-1 py-10')}>
                    <TamaguiButton
                        neonEffect={true}
                        title={loading ? 'Cargando...' : 'Actividad diaria'}
                        variantColor='blue'
                        onPress={() => {
                            router.push("/features/activity/screens/emotion");
                        }}
                        icon='play-arrow'
                        disabled={loading}
                        buttonType='iconTop'
                        iconSize={24}
                        fullWidth={true}
                        style={tailwind('text-xl text-white h-60')}
                    />
                </View>
                {!historyActivate &&
                    <View style={tailwind('flex-1 mx-1 py-10')}>
                        <TamaguiButton
                            neonEffect={true}
                            title={loading ? 'Cargando...' : 'Historial'}
                            variantColor='green'
                            onPress={() => {
                                setHistoryActivate(true);
                            }}
                            icon='history'
                            disabled={loading}
                            buttonType='iconTop'
                            iconSize={24}
                            fullWidth={true}
                            style={tailwind('text-xl text-white h-60')}
                        />
                    </View>
                }
                {historyActivate &&
                    <View style={tailwind('flex-1 mx-1 py-10')}>
                        <TamaguiButton
                            neonEffect={true}
                            title={loading ? 'Cargando...' : 'Inicio'}
                            variantColor='purple'
                            onPress={() => {
                                setHistoryActivate(false);
                            }}
                            icon='home'
                            disabled={loading}
                            buttonType='iconTop'
                            iconSize={24}
                            fullWidth={true}
                            style={tailwind('text-xl text-white h-60')}
                        />
                    </View>
                }
                <View style={tailwind('flex-1 mx-1 py-10')}>
                    <TamaguiButton
                        neonEffect={true}
                        title='Cerrar sesión'
                        variantColor='red'
                        onPress={async () => {
                            await clearParticipant();
                            logout();
                        }}
                        icon='exit-to-app'
                        buttonType='iconTop'
                        iconSize={24}
                        fullWidth={true}
                        style={tailwind('text-xl text-white h-60')}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#EAEAEA',
        padding: 4,
        borderColor: 'transparent',
    },
});