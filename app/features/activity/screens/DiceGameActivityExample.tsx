import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import DiceGameScreen from './DiceGameScreen';
import useActivityStore from '@/shared/store/activity.store';
import ProgressBarII from '@/shared/components/ui/ProgressBarNew';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Componente de ejemplo que muestra cómo integrar el juego de dados
 * en la estructura de actividades existente. Este componente actúa como
 * un contenedor que proporciona el contexto necesario para la actividad
 * y maneja la integración con el sistema de actividades de la aplicación.
 * 
 * @returns {JSX.Element} Componente renderizado
 */
const DiceGameActivityExample: React.FC = () => {
    const tailwind = useTailwind();
    const { actions } = useActivityStore();

    // Inicializar el store de actividades al montar el componente
    useEffect(() => {
        // Configurar el tipo de actividad como juego de dados
        actions.setActivityType('Question'); // Usar el tipo existente más cercano
        actions.initialize(1); // Inicializar con un solo paso para esta actividad

        return () => {
            // Limpiar el store al desmontar
            actions.reset();
        };
    }, [actions]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#F9FAFB', '#F3F4F6']}
                style={styles.gradientBackground}
            >
                {/* Encabezado con barra de progreso */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Actividad: Juego de Dados</Text>
                    <ProgressBarII
                        currentStep={1}
                        totalSteps={1}
                        style={styles.progressBar}
                    />
                </View>

                <View style={styles.content}>
                    <DiceGameScreen />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gradientBackground: {
        flex: 1,
        width: '100%',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 8,
    },
    progressBar: {
        marginVertical: 8,
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export default DiceGameActivityExample;