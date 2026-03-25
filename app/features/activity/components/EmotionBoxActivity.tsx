import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Image, TouchableOpacity, Platform } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { MaterialIcons } from '@expo/vector-icons';
import { useSubmitResponse } from '../hooks/activity';
import useUser from '@/context/UserContext';
import EmotionBadge from './EmotionBadge';
import { EmotionConfig, EmotionBoxActivityProps, EmotionActivityResult, EmotionPlacement } from '../types/emotion-box';

// Emociones predeterminadas si no se proporcionan
const DEFAULT_EMOTIONS: EmotionConfig[] = [
    { id: '1', name: 'alegría', type: 'sana' },
    { id: '2', name: 'gratitud', type: 'sana' },
    { id: '3', name: 'tranquilidad', type: 'sana' },
    { id: '4', name: 'amor', type: 'sana' },
    { id: '5', name: 'tristeza', type: 'gestionar' },
    { id: '6', name: 'enojo', type: 'gestionar' },
    { id: '7', name: 'ansiedad', type: 'gestionar' },
    { id: '8', name: 'miedo', type: 'gestionar' },
];

/**
 * Componente de actividad de Caja de Emociones
 * Permite arrastrar emociones a dos cajas diferentes: "emociones sanas" y "emociones por gestionar"
 * @param {EmotionBoxActivityProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente EmotionBoxActivity
 */
const EmotionBoxActivity: React.FC<EmotionBoxActivityProps> = ({
    activityId,
    emotions = DEFAULT_EMOTIONS,
    onComplete,
    timeLimit = 120, // 2 minutos por defecto
}) => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const { mutate: submitResponse } = useSubmitResponse();

    // Estado para las emociones disponibles y colocadas
    const [availableEmotions, setAvailableEmotions] = useState<EmotionConfig[]>(emotions);
    const [healthyBoxEmotions, setHealthyBoxEmotions] = useState<EmotionConfig[]>([]);
    const [manageBoxEmotions, setManageBoxEmotions] = useState<EmotionConfig[]>([]);

    // Estado para el tiempo y puntuación
    const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
    const [score, setScore] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [startTime] = useState<number>(Date.now());

    // Referencias para las cajas
    const healthyBoxRef = useRef<View>(null);
    const manageBoxRef = useRef<View>(null);

    // Medidas de las cajas
    const [healthyBoxLayout, setHealthyBoxLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [manageBoxLayout, setManageBoxLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Estado para la emoción que se está arrastrando actualmente
    const [currentDragEmotion, setCurrentDragEmotion] = useState<EmotionConfig | null>(null);

    // Animaciones para efectos visuales
    const boxPulseAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    // Temporizador
    useEffect(() => {
        if (isCompleted) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleActivityComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isCompleted]);

    // Efecto de pulso para las cajas
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(boxPulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(boxPulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Función para manejar la finalización de la actividad
    const handleActivityComplete = () => {
        if (isCompleted) return;

        setIsCompleted(true);
        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        // Calcular puntuación final y registrar colocaciones
        const placements: EmotionPlacement[] = [
            ...healthyBoxEmotions.map(emotion => ({
                emotionId: emotion.id,
                boxType: 'sana',
                isCorrect: emotion.type === 'sana',
            })),
            ...manageBoxEmotions.map(emotion => ({
                emotionId: emotion.id,
                boxType: 'gestionar',
                isCorrect: emotion.type === 'gestionar',
            })),
        ];

        const correctPlacements = placements.filter(p => p.isCorrect).length;
        const finalScore = Math.round((correctPlacements / emotions.length) * 100);

        setScore(finalScore);

        // Preparar resultado para API
        const result: EmotionActivityResult = {
            studentId: user?.id || '',
            score: finalScore,
            timeSpent,
            placements,
        };

        // Enviar resultado a la API
        submitResponse({
            activityId,
            userId: user?.id || '',
            answers: result,
        });

        // Llamar al callback si existe
        if (onComplete) {
            onComplete(result);
        }

        // Animación de éxito
        Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    // Crear un PanResponder para cada emoción
    const createPanResponder = (emotion: EmotionConfig) => {
        const pan: any = useRef(new Animated.ValueXY()).current;

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setCurrentDragEmotion(emotion);
                pan.setOffset({
                    x: pan.x?._value,
                    y: pan.y?._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: (_, gesture) => {
                // Verificar si la emoción se soltó en alguna de las cajas
                const isInHealthyBox =
                    gesture.moveX > healthyBoxLayout.x &&
                    gesture.moveX < healthyBoxLayout.x + healthyBoxLayout.width &&
                    gesture.moveY > healthyBoxLayout.y &&
                    gesture.moveY < healthyBoxLayout.y + healthyBoxLayout.height;

                const isInManageBox =
                    gesture.moveX > manageBoxLayout.x &&
                    gesture.moveX < manageBoxLayout.x + manageBoxLayout.width &&
                    gesture.moveY > manageBoxLayout.y &&
                    gesture.moveY < manageBoxLayout.y + manageBoxLayout.height;

                if (isInHealthyBox) {
                    // Añadir a la caja de emociones sanas
                    setHealthyBoxEmotions(prev => [...prev, emotion]);
                    setAvailableEmotions(prev => prev.filter(e => e.id !== emotion.id));

                    // Actualizar puntuación
                    if (emotion.type === 'sana') {
                        setScore(prev => prev + 10);
                        playSuccessAnimation();
                    } else {
                        setScore(prev => Math.max(0, prev - 5));
                    }
                } else if (isInManageBox) {
                    // Añadir a la caja de emociones por gestionar
                    setManageBoxEmotions(prev => [...prev, emotion]);
                    setAvailableEmotions(prev => prev.filter(e => e.id !== emotion.id));

                    // Actualizar puntuación
                    if (emotion.type === 'gestionar') {
                        setScore(prev => prev + 10);
                        playSuccessAnimation();
                    } else {
                        setScore(prev => Math.max(0, prev - 5));
                    }
                }

                // Resetear la posición y el estado de arrastre
                pan.flattenOffset();
                setCurrentDragEmotion(null);

                // Si no quedan emociones disponibles, completar la actividad
                if (availableEmotions.length <= 1) {
                    handleActivityComplete();
                }
            },
        });

        return { pan, panResponder };
    };

    // Crear panResponders para cada emoción
    const emotionPanResponders = availableEmotions.reduce((acc, emotion) => {
        acc[emotion.id] = createPanResponder(emotion);
        return acc;
    }, {} as Record<string, { pan: Animated.ValueXY; panResponder: any }>);

    // Animación de éxito cuando se coloca correctamente
    const playSuccessAnimation = () => {
        Animated.sequence([
            Animated.timing(successAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(successAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Formatear tiempo restante
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            {/* Cabecera con tiempo y puntuación */}
            <View style={styles.header}>
                <View style={styles.timerContainer}>
                    <MaterialIcons name="timer" size={24} color="#4B5563" />
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </View>

                <View style={styles.scoreContainer}>
                    <MaterialIcons name="star" size={24} color="#F59E0B" />
                    <Text style={styles.scoreText}>{score}</Text>
                </View>
            </View>

            {/* Instrucciones */}
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Caja de Emociones</Text>
                <Text style={styles.instructionsText}>
                    Arrastra cada emoción a la caja correspondiente: "Emociones Sanas" o "Emociones por Gestionar".
                </Text>
            </View>

            {/* Contenedor principal de la actividad */}
            <View style={styles.activityContainer}>
                {/* Caja de emociones sanas */}
                <Animated.View
                    ref={healthyBoxRef}
                    style={[
                        styles.emotionBox,
                        styles.healthyBox,
                        {
                            transform: [
                                { scale: currentDragEmotion ? boxPulseAnim : 1 },
                            ],
                        },
                    ]}
                    onLayout={(event) => {
                        const { x, y, width, height } = event.nativeEvent.layout;
                        setHealthyBoxLayout({ x, y, width, height });
                    }}
                >
                    <Text style={styles.boxTitle}>Emociones Sanas</Text>
                    <View style={styles.boxContent}>
                        {healthyBoxEmotions.map((emotion) => (
                            <View key={emotion.id} style={styles.placedEmotion}>
                                <EmotionBadge emotion={emotion.name} size="small" />
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Caja de emociones por gestionar */}
                <Animated.View
                    ref={manageBoxRef}
                    style={[
                        styles.emotionBox,
                        styles.manageBox,
                        {
                            transform: [
                                { scale: currentDragEmotion ? boxPulseAnim : 1 },
                            ],
                        },
                    ]}
                    onLayout={(event) => {
                        const { x, y, width, height } = event.nativeEvent.layout;
                        setManageBoxLayout({ x, y, width, height });
                    }}
                >
                    <Text style={styles.boxTitle}>Emociones por Gestionar</Text>
                    <View style={styles.boxContent}>
                        {manageBoxEmotions.map((emotion) => (
                            <View key={emotion.id} style={styles.placedEmotion}>
                                <EmotionBadge emotion={emotion.name} size="small" />
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </View>

            {/* Emociones disponibles para arrastrar */}
            <View style={styles.emotionsContainer}>
                {availableEmotions.map((emotion) => {
                    const { pan, panResponder } = emotionPanResponders[emotion.id];

                    return (
                        <Animated.View
                            key={emotion.id}
                            style={{
                                transform: [{ translateX: pan.x }, { translateY: pan.y }],
                                zIndex: currentDragEmotion?.id === emotion.id ? 10 : 1,
                            }}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.emotionItem}>
                                <EmotionBadge emotion={emotion.name} />
                            </View>
                        </Animated.View>
                    );
                })}
            </View>

            {/* Pantalla de resultados cuando se completa */}
            {isCompleted && (
                <Animated.View
                    style={[
                        styles.resultsContainer,
                        {
                            opacity: successAnim,
                            transform: [{ scale: Animated.add(1, Animated.multiply(successAnim, 0.1)) }],
                        },
                    ]}
                >
                    <View style={styles.resultsContent}>
                        <MaterialIcons name="check-circle" size={64} color="#10B981" />
                        <Text style={styles.resultsTitle}>¡Actividad Completada!</Text>
                        <Text style={styles.resultsScore}>Puntuación: {score}</Text>
                        <Text style={styles.resultsTime}>
                            Tiempo: {formatTime(timeLimit - timeRemaining)}
                        </Text>

                        <TouchableOpacity
                            style={styles.resultsButton}
                            onPress={() => {
                                // Reiniciar la actividad o navegar a otra pantalla
                            }}
                        >
                            <Text style={styles.resultsButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {/* Animación de éxito */}
            <Animated.View
                style={[
                    styles.successAnimation,
                    {
                        opacity: successAnim,
                        transform: [{ scale: Animated.add(1, Animated.multiply(successAnim, 0.5)) }],
                    },
                ]}
            >
                <MaterialIcons name="check-circle" size={100} color="#10B981" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    timerText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    scoreText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#92400E',
    },
    instructionsContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1E40AF',
    },
    instructionsText: {
        fontSize: 14,
        color: '#1E3A8A',
        lineHeight: 20,
    },
    activityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    emotionBox: {
        width: '48%',
        minHeight: 200,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    healthyBox: {
        backgroundColor: '#D1FAE5',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    manageBox: {
        backgroundColor: '#FEE2E2',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    boxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    boxContent: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    emotionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    emotionItem: {
        margin: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 4,
    },
    placedEmotion: {
        margin: 4,
    },
    resultsContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    resultsContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        width: '80%',
        maxWidth: 400,
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    resultsScore: {
        fontSize: 18,
        color: '#4B5563',
        marginBottom: 8,
    },
    resultsTime: {
        fontSize: 18,
        color: '#4B5563',
        marginBottom: 24,
    },
    resultsButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    resultsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successAnimation: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -50,
        marginTop: -50,
        zIndex: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EmotionBoxActivity;