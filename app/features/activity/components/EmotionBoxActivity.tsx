import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { MaterialIcons } from '@expo/vector-icons';
import { useSubmitResponse } from '../hooks/activity';
import useUser from '@/context/UserContext';
import EmotionBadge from './EmotionBadge';
import { EmotionConfig, EmotionBoxActivityProps, EmotionActivityResult, EmotionPlacement } from '../types/emotion-box';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSafeKeyObjectFromStorage } from '@/shared/utils/safe-token-storage';

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
 * Click en emoción para seleccionar, luego click en caja destino para colocar
 */
const EmotionBoxActivity: React.FC<EmotionBoxActivityProps> = ({
    activityId,
    emotions = DEFAULT_EMOTIONS,
    onComplete,
    timeLimit = 120,
}) => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const { mutate: submitResponse } = useSubmitResponse();

    const [availableEmotions, setAvailableEmotions] = useState<EmotionConfig[]>(emotions);
    const [healthyBoxEmotions, setHealthyBoxEmotions] = useState<EmotionConfig[]>([]);
    const [manageBoxEmotions, setManageBoxEmotions] = useState<EmotionConfig[]>([]);

    const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
    const [score, setScore] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [startTime] = useState<number>(Date.now());

    // Click-based selection: emoción seleccionada actualmente
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionConfig | null>(null);

    // Animaciones
    const boxPulseAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    const getUserId = async () => {
        if (Platform.OS === 'web') {
            return getSafeKeyObjectFromStorage('userId');
        } else {
            return await AsyncStorage.getItem('userId');
        }
    };

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

    // Click en emoción disponible: seleccionar/deseleccionar
    const handleEmotionTap = (emotion: EmotionConfig) => {
        if (isCompleted) return;
        // Si ya está seleccionada, deseleccionar
        if (selectedEmotion?.id === emotion.id) {
            setSelectedEmotion(null);
        } else {
            setSelectedEmotion(emotion);
        }
    };

    // Click en caja destino: colocar emoción seleccionada
    const handleBoxTap = (targetBox: 'sana' | 'gestionar') => {
        if (isCompleted || !selectedEmotion) return;

        const emotion = selectedEmotion;
        const isCorrect = emotion.type === targetBox;

        // Calcular el estado POSTERIOR a la colocación (para handleActivityComplete)
        const nextHealthy = targetBox === 'sana' ? [...healthyBoxEmotions, emotion] : healthyBoxEmotions;
        const nextManage = targetBox === 'gestionar' ? [...manageBoxEmotions, emotion] : manageBoxEmotions;
        const nextAvailable = availableEmotions.filter(e => e.id !== emotion.id);

        // Colocar emoción en la caja
        if (targetBox === 'sana') {
            setHealthyBoxEmotions(nextHealthy);
        } else {
            setManageBoxEmotions(nextManage);
        }

        // Remover de disponibles
        setAvailableEmotions(nextAvailable);
        setSelectedEmotion(null);

        // Actualizar puntuación
        if (isCorrect) {
            setScore(prev => prev + 10);
            playSuccessAnimation();
        } else {
            setScore(prev => Math.max(0, prev - 5));
        }

        // Verificar si ya no quedan emociones (usar nextAvailable que ya tiene el valor post-actualización)
        if (nextAvailable.length === 0) {
            handleActivityCompleteWith(nextHealthy, nextManage);
        }
    };

    // Finalizar actividad (usado por el timer)
    const handleActivityComplete = async () => {
        if (isCompleted) return;
        await finishGame(healthyBoxEmotions, manageBoxEmotions);
    };

    // Finalizar actividad con arrays explícitos (evita stale closure al colocar última emoción)
    const handleActivityCompleteWith = async (healthy: EmotionConfig[], manage: EmotionConfig[]) => {
        if (isCompleted) return;
        await finishGame(healthy, manage);
    };

    const finishGame = async (healthy: EmotionConfig[], manage: EmotionConfig[]) => {
        if (isCompleted) return;
        setIsCompleted(true);
        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        const placements: EmotionPlacement[] = [
            ...healthy.map(emotion => ({
                emotionId: emotion.id,
                boxType: 'sana' as const,
                isCorrect: emotion.type === 'sana',
            })),
            ...manage.map(emotion => ({
                emotionId: emotion.id,
                boxType: 'gestionar' as const,
                isCorrect: emotion.type === 'gestionar',
            })),
        ];

        const correctPlacements = placements.filter(p => p.isCorrect).length;
        const finalScore = Math.round((correctPlacements / emotions.length) * 100);
        setScore(finalScore);

        const userId = await getUserId();
        const result: EmotionActivityResult = {
            studentId: userId || '',
            score: finalScore,
            timeSpent,
            placements,
        };

        submitResponse({
            activityId,
            userId: userId || '',
            answers: result,
        });

        if (onComplete) onComplete(result);

        Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const playSuccessAnimation = () => {
        Animated.sequence([
            Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            {!isCompleted && (
                <>
                    {/* Header */}
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
                            Toca una emoción para seleccionarla, luego toca la caja donde quieras colocarla.
                        </Text>
                    </View>

                    {/* Contenedor principal */}
                    <View style={styles.activityContainer}>
                        {/* Caja emociones sanas */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleBoxTap('sana')}
                            style={[
                                styles.emotionBox,
                                styles.healthyBox,
                                selectedEmotion && { borderColor: '#047857', borderWidth: 3 },
                            ]}
                        >
                            <Text style={styles.boxTitle}>Emociones Sanas</Text>
                            <View style={styles.boxContent}>
                                {healthyBoxEmotions.map((emotion) => (
                                    <View key={emotion.id} style={styles.placedEmotion}>
                                        <EmotionBadge emotion={emotion.name} size="small" />
                                    </View>
                                ))}
                                {healthyBoxEmotions.length === 0 && selectedEmotion && (
                                    <Text style={styles.boxHint}>Toca aquí para colocar</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Caja emociones por gestionar */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleBoxTap('gestionar')}
                            style={[
                                styles.emotionBox,
                                styles.manageBox,
                                selectedEmotion && { borderColor: '#B91C1C', borderWidth: 3 },
                            ]}
                        >
                            <Text style={styles.boxTitle}>Emociones por Gestionar</Text>
                            <View style={styles.boxContent}>
                                {manageBoxEmotions.map((emotion) => (
                                    <View key={emotion.id} style={styles.placedEmotion}>
                                        <EmotionBadge emotion={emotion.name} size="small" />
                                    </View>
                                ))}
                                {manageBoxEmotions.length === 0 && selectedEmotion && (
                                    <Text style={styles.boxHint}>Toca aquí para colocar</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Emociones disponibles */}
                    <View style={styles.emotionsContainer}>
                        {availableEmotions.map((emotion) => {
                            const isSelected = selectedEmotion?.id === emotion.id;
                            return (
                                <TouchableOpacity
                                    key={emotion.id}
                                    activeOpacity={0.7}
                                    onPress={() => handleEmotionTap(emotion)}
                                    style={[
                                        styles.emotionItem,
                                        isSelected && styles.emotionItemSelected,
                                    ]}
                                >
                                    <EmotionBadge emotion={emotion.name} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedEmotion && (
                        <Text style={styles.selectionHint}>
                            Seleccionaste: {selectedEmotion.name}. Toca una caja para colocarla.
                        </Text>
                    )}
                </>
            )}

            {/* Resultados */}
            {isCompleted && (
                <View style={styles.resultsOverlay}>
                    <View style={styles.resultsCard}>
                        <MaterialIcons name="check-circle" size={80} color="#10B981" />
                        <Text style={styles.resultsTitle}>¡Actividad Completada!</Text>
                        <Text style={styles.resultsScore}>Puntuación: {score}</Text>
                        <Text style={styles.resultsTime}>
                            Tiempo: {formatTime(timeLimit - timeRemaining)}
                        </Text>
                        <TouchableOpacity style={styles.resultsButton} onPress={() => {}}>
                            <Text style={styles.resultsButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    boxHint: {
        color: '#6B7280',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
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
    emotionItemSelected: {
        borderWidth: 3,
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
        transform: [{ scale: 1.1 }],
    },
    placedEmotion: {
        margin: 4,
    },
    selectionHint: {
        textAlign: 'center',
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 12,
        fontStyle: 'italic',
    },
    resultsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(16, 185, 129, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    resultsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        width: '95%',
        maxWidth: 380,
        minHeight: 400,
    },
    resultsTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    resultsScore: {
        fontSize: 22,
        fontWeight: '600',
        color: '#10B981',
        marginBottom: 12,
    },
    resultsTime: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 32,
    },
    resultsButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    resultsButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EmotionBoxActivity;
