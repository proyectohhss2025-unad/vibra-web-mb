import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, ScrollView } from 'react-native';
import { DiceQuestion } from '../components/DiceGameConfig';
import DiceGameActivity from '../components/DiceGameActivity';
import DiceGameConfig from '../components/DiceGameConfig';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import { Ionicons } from '@expo/vector-icons';
import useParticipant from '@/context/ParticipantContext';
import { ActivityService } from '@shared/services/api/api';

/**
 * Interfaz para los resultados del juego
 */
interface GameResult {
    studentId: string;
    studentName: string;
    diceValue: number;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    responseTime: number;
    points: number;
    timestamp: number;
}

interface DiceGameScreenProps {
    questions?: DiceQuestion[];
    /** ID real de la actividad (MongoId) para registrar la completación del juego. Opcional: si no llega, el botón "Enviar resultados" solo prepara los datos. */
    activityId?: string;
}

/**
 * Componente principal para la pantalla del juego de dados
 * @returns {JSX.Element} Componente renderizado
 */
const DiceGameScreen: React.FC<DiceGameScreenProps> = ({ questions: propQuestions, activityId }) => {
    // Estados del componente
    const [questions, setQuestions] = useState<DiceQuestion[]>(propQuestions ?? []);
    const [showConfig, setShowConfig] = useState(false);
    const [gameResults, setGameResults] = useState<GameResult[]>([]);
    const [studentInfo, setStudentInfo] = useState({
        id: 'student-001',
        name: 'Estudiante de Prueba'
    });
    const { participant } = useParticipant();

    // Preguntas de ejemplo para demostración
    useEffect(() => {
        // Solo cargar preguntas de ejemplo si no hay preguntas configuradas
        if (questions.length === 0) {
            const sampleQuestions: DiceQuestion[] = [
                {
                    id: '1',
                    questionText: '¿Cuál es la capital de Colombia?',
                    diceValue: 1,
                    type: 'multiple',
                    options: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'],
                    correctAnswer: 'Bogotá'
                },
                {
                    id: '2',
                    questionText: 'Describe brevemente qué es la fotosíntesis',
                    diceValue: 2,
                    type: 'open',
                    correctAnswer: 'proceso por el cual las plantas utilizan la luz solar para crear energía'
                },
                {
                    id: '3',
                    questionText: '¿Cuál es el resultado de 8 × 7?',
                    diceValue: 3,
                    type: 'multiple',
                    options: ['54', '56', '58', '62'],
                    correctAnswer: '56'
                },
                {
                    id: '4',
                    questionText: 'Nombra un animal que vive en el océano',
                    diceValue: 4,
                    type: 'open',
                    correctAnswer: 'ballena'
                },
                {
                    id: '5',
                    questionText: '¿Cuál de estos NO es un planeta del sistema solar?',
                    diceValue: 5,
                    type: 'multiple',
                    options: ['Marte', 'Plutón', 'Venus', 'Júpiter'],
                    correctAnswer: 'Plutón'
                },
                {
                    id: '6',
                    questionText: '¿Cuál es el río más largo del mundo?',
                    diceValue: 6,
                    type: 'multiple',
                    options: ['Amazonas', 'Nilo', 'Misisipi', 'Yangtsé'],
                    correctAnswer: 'Nilo'
                }
            ];
            setQuestions(sampleQuestions);
        }
    }, []);

    /**
     * Maneja el guardado de las preguntas configuradas
     * @param {DiceQuestion[]} configuredQuestions - Preguntas configuradas
     */
    const handleSaveQuestions = (configuredQuestions: DiceQuestion[]) => {
        setQuestions(configuredQuestions);
        // Aquí se podría implementar la persistencia de las preguntas en una base de datos
    };

    /**
     * Maneja la finalización de un juego
     * @param {GameResult} result - Resultado del juego
     */
    const handleGameComplete = (result: GameResult) => {
        setGameResults([...gameResults, result]);
        // Aquí se podría implementar el envío de los resultados a una API
        console.log('Resultado del juego:', result);
    };

    /**
     * Alterna entre la vista de juego y la vista de configuración
     */
    const toggleConfigView = () => {
        setShowConfig(!showConfig);
    };

    /**
     * Prepara los datos para enviar a la API
     */
    const prepareDataForAPI = () => {
        // Estructura de datos para enviar a la API
        const apiData = {
            studentId: studentInfo.id,
            activityType: 'DiceGame',
            timestamp: Date.now(),
            results: gameResults.map(result => ({
                questionId: result.questionId,
                diceValue: result.diceValue,
                answer: result.answer,
                isCorrect: result.isCorrect,
                responseTime: result.responseTime,
                points: result.points
            }))
        };

        console.log('Datos listos para enviar a la API:', apiData);

        // Registrar la completación del juego vía createCompletion
        // (requiere participant + activityId real + al menos 1 resultado)
        if (participant?._id && /^[0-9a-fA-F]{24}$/.test(activityId || '') && gameResults.length > 0) {
            const achievedScore = gameResults.reduce((sum, r) => sum + r.points, 0);
            const timeSpent = gameResults.reduce((sum, r) => sum + r.responseTime, 0);
            ActivityService.createCompletion({
                participant: participant._id,
                activity: activityId || '',
                plannedScore: 120,
                achievedScore,
                timeSpent,
                gamesCompleted: [{ type: 'DiceGame', score: achievedScore, maxScore: 120 }],
            }).catch((err: any) =>
                console.warn('[DiceGame] Error registering completion:', err?.message),
            );
        }

        // Aquí se implementaría la llamada a la API
        return apiData;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Encabezado */}
            {/*
            <View style={styles.header}>
                <Text style={styles.title}>Juego de Dados Educativo</Text>
                <TamaguiButton
                    title={showConfig ? "Ver Juego" : "Configurar"}
                    variantColor="purple"
                    onPress={toggleConfigView}
                    icon={showConfig ? "casino" : "settings"}
                    style={styles.configButton}
                />
            </View>
            */}

            {/* Contenido principal */}
            <ScrollView style={styles.content}>
                {showConfig ? (
                    <DiceGameConfig
                        onSaveQuestions={handleSaveQuestions}
                        initialQuestions={questions}
                    />
                ) : (
                    <View>
                        {questions.length > 0 ? (
                            <DiceGameActivity
                                studentId={studentInfo.id}
                                studentName={studentInfo.name}
                                questions={questions}
                                onComplete={handleGameComplete}
                            />
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <Ionicons name="alert-circle" size={60} color="#A78BFA" />
                                <Text style={styles.emptyStateText}>
                                    No hay preguntas configuradas. Por favor, configura al menos una pregunta para cada valor del dado.
                                </Text>
                                <TamaguiButton
                                    title="Configurar preguntas"
                                    variantColor="purple"
                                    neonEffect={true}
                                    onPress={toggleConfigView}
                                    icon="settings"
                                    style={styles.emptyStateButton}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Sección de resultados */}
            {gameResults.length > 0 && !showConfig && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>
                        Resultados ({gameResults.length})
                    </Text>
                    <View style={styles.resultsStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Puntos totales:</Text>
                            <Text style={styles.statValue}>
                                {gameResults.reduce((sum, result) => sum + result.points, 0)}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Correctas:</Text>
                            <Text style={styles.statValue}>
                                {gameResults.filter(result => result.isCorrect).length}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Tiempo promedio:</Text>
                            <Text style={styles.statValue}>
                                {(gameResults.reduce((sum, result) => sum + result.responseTime, 0) / gameResults.length).toFixed(1)}s
                            </Text>
                        </View>
                    </View>
                    <TamaguiButton
                        title="Enviar resultados"
                        variantColor="green"
                        neonEffect={true}
                        onPress={prepareDataForAPI}
                        icon="send"
                        style={styles.sendButton}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    configButton: {
        height: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        marginVertical: 16,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#4B5563',
        marginVertical: 16,
    },
    emptyStateButton: {
        marginTop: 16,
    },
    resultsContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    resultsStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    sendButton: {
        marginTop: 8,
    },
});

export default DiceGameScreen;