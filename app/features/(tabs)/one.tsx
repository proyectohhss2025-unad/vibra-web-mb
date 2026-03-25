import useAuth from '@/shared/hooks/useAuth';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import CardComponent from '../../shared/components/ui/CardComponent';
import CustomButton from '../../shared/components/ui/CustomButton';
import CardSlider from '../../shared/components/ui/CardSlider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ActivityHistoryList from '../activity/screens/ActivityHistoryList';
import FloatButton from '@/shared/components/ui/animation/FloatButton';

export default function TabOne() {
    const tailwind = useTailwind();
    const { logout } = useAuth();
    const router = useRouter();
    const [historyActivate, setHistoryActivate] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <ScrollView style={[styles.scrollView, tailwind('bg-gray-50 p-4')]}>

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
                    <CustomButton
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
                        <CustomButton
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
                        <CustomButton
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
                    <CustomButton
                        neonEffect={true}
                        title='Cerrar sesión'
                        variantColor='red'
                        onPress={logout}
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