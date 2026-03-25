import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, ScrollView, Platform } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { useSubmitResponse } from '../hooks/activity';
import useUser from '@/context/UserContext';
import useActivityStore from '@/shared/store/activity.store';
import ScoreCounter from './ScoreCounter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CustomButton from '@/shared/components/ui/CustomButton';

// Component types
interface MatchingConceptsGameProps {
    conceptPairs?: Array<{ id: string; concept: string; match: string }>;
    timeLimit?: number; // in seconds
    activityId?: string;
    onComplete?: (results: GameResults) => void;
}

interface GameResults {
    studentInfo: {
        id: string;
        name: string;
    };
    timeSpent: number; // in seconds
    score: number;
    matchedPairs: number;
    totalPairs: number;
}

interface ConceptItem {
    id: string;
    text: string;
    type: 'concept' | 'match';
    originalId: string;
    selected: boolean;
    matched: boolean;
    position: Animated.ValueXY;
}

const MatchingConceptsGame: React.FC<MatchingConceptsGameProps> = ({
    conceptPairs = [
        { id: '1', concept: 'React', match: 'Biblioteca JavaScript para interfaces' },
        { id: '2', concept: 'TypeScript', match: 'JavaScript con tipado estático' },
        { id: '3', concept: 'API', match: 'Interfaz de programación de aplicaciones' },
        { id: '4', concept: 'CSS', match: 'Lenguaje de estilos en cascada' },
        { id: '5', concept: 'HTML', match: 'Lenguaje de marcado de hipertexto' },
    ],
    timeLimit = 180, // default 3 minutes
    activityId = 'matching-concepts-activity',
    onComplete,
}) => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const submitResponse = useSubmitResponse();

    // Game states
    const [items, setItems] = useState<ConceptItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ConceptItem | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [gameComplete, setGameComplete] = useState<boolean>(false);

    const { actions } = useActivityStore.getState();

    // Animations
    const scoreAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    // Game timer
    useEffect(() => {
        if (startTime > 0 && !gameComplete) {
            const timer = setInterval(() => {
                const currentTime = Math.floor((Date.now() - startTime) / 1000);
                setTimeSpent(currentTime);

                // Verificar si se acabó el tiempo
                if (currentTime >= timeLimit) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [startTime, gameComplete]);

    // Check if game completed (all pairs matched)
    useEffect(() => {
        if (matchedPairs.length === conceptPairs.length && startTime > 0 && !gameComplete) {
            endGame();
        }
    }, [matchedPairs]);

    // Initialize game
    const initializeGame = () => {
        // Create array with all concepts and their matches
        const allItems: ConceptItem[] = [];

        // Add concepts
        conceptPairs.forEach(pair => {
            allItems.push({
                id: `concept-${pair.id}`,
                text: pair.concept,
                type: 'concept',
                originalId: pair.id,
                selected: false,
                matched: false,
                position: new Animated.ValueXY({ x: 0, y: 0 }),
            });

            // Add matches
            allItems.push({
                id: `match-${pair.id}`,
                text: pair.match,
                type: 'match',
                originalId: pair.id,
                selected: false,
                matched: false,
                position: new Animated.ValueXY({ x: 0, y: 0 }),
            });
        });

        // Mix the elements
        const shuffledItems = shuffleArray(allItems);
        setItems(shuffledItems);
        setStartTime(Date.now());
    };

    // Shuffle array (Fisher-Yates algorithm)
    const shuffleArray = (array: ConceptItem[]): ConceptItem[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Handle item selection
    const handleItemPress = (item: ConceptItem) => {
        if (gameComplete || item.matched) return;

        // Animate the selected element
        Animated.sequence([
            Animated.timing(item.position, {
                toValue: { x: 5, y: 0 },
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(item.position, {
                toValue: { x: -5, y: 0 },
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(item.position, {
                toValue: { x: 0, y: 0 },
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();

        // If no item is selected, select this one
        if (!selectedItem) {
            const updatedItems = items.map(i =>
                i.id === item.id ? { ...i, selected: true } : i
            );
            setItems(updatedItems);
            setSelectedItem(item);
            return;
        }

        // If item is already selected, deselect it
        if (selectedItem.id === item.id) {
            const updatedItems = items.map(i =>
                i.id === item.id ? { ...i, selected: false } : i
            );
            setItems(updatedItems);
            setSelectedItem(null);
            return;
        }

        // Check if items match (same originalId but different type)
        if (selectedItem.originalId === item.originalId && selectedItem.type !== item.type) {
            // Match found!
            const newMatchedPairs = [...matchedPairs, item.originalId];
            setMatchedPairs(newMatchedPairs);

            // Update score
            const pairScore = 50;
            const newScore = score + pairScore;
            setScore(newScore);

            // Animate punctuation
            Animated.sequence([
                Animated.timing(scoreAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scoreAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Update elements
            const updatedItems = items.map(i =>
                i.id === item.id || i.id === selectedItem.id
                    ? { ...i, selected: false, matched: true }
                    : i
            );
            setItems(updatedItems);
            setSelectedItem(null);
        } else {
            // They do not match, animate shake
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            // Update items after short delay
            setTimeout(() => {
                const updatedItems = items.map(i =>
                    (i.id === item.id || i.id === selectedItem.id)
                        ? { ...i, selected: false }
                        : i
                );
                setItems(updatedItems);
                setSelectedItem(null);
            }, 500);
        }
    };

    // End game
    const endGame = () => {
        setGameComplete(true);

        // Calculate final results
        const finalTimeSpent = Math.min(timeSpent, timeLimit);
        const timeBonus = Math.max(0, timeLimit - finalTimeSpent) * 2;
        const finalScore = score + timeBonus + (matchedPairs.length === conceptPairs.length ? 100 : 0); // Bonus for matching all concepts

        const results: GameResults = {
            studentInfo: {
                id: user?.id || 'guest',
                name: user?.name || 'Invitado',
            },
            timeSpent: finalTimeSpent,
            score: finalScore,
            matchedPairs: matchedPairs.length,
            totalPairs: conceptPairs.length,
        };

        // Send results to API
        if (user?.id) {
            submitResponse.mutate({
                activityId,
                userId: user.id,
                answers: {
                    score: finalScore,
                    timeSpent: finalTimeSpent,
                    matchedPairs: matchedPairs.length,
                    totalPairs: conceptPairs.length,
                },
            });
        }

        // Call callback if exists
        if (onComplete) {
            onComplete(results);
        }

        // Show completion message and redirect user
        /*if (Platform.OS === 'web') {
            actions.nextActivityType();
            actions.reset();
            router.push('/features/(tabs)/one');
        } else {*/
        Alert.alert(
            '¡Actividad completada!',
            `Has emparejado ${matchedPairs.length} de ${conceptPairs.length} conceptos.\nPuntuación: ${finalScore}\nTiempo: ${formatTime(finalTimeSpent)}`,
            [{
                text: 'Finalizar',
                onPress: () => {
                    // Reiniciar el estado de la actividad y redirigir al usuario
                    actions.reset();
                    router.push('/features/(tabs)/one');
                }
            }]
        );
        //}
    };

    // Score scale animation
    const scoreScale = scoreAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
    });

    // Format time as mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Render an item (concept or match)
    const renderItem = (item: ConceptItem) => {
        const itemStyle = [
            styles.item,
            item.type === 'concept' ? styles.conceptItem : styles.matchItem,
            item.selected && styles.selectedItem,
            item.matched && styles.matchedItem,
        ];

        const textStyle = [
            styles.itemText,
            item.type === 'concept' ? styles.conceptText : styles.matchText,
            item.matched && styles.matchedText,
        ];

        const shakeInterpolation = item.selected && selectedItem?.id === item.id
            ? shakeAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-5deg', '0deg', '5deg']
            })
            : '0deg';

        return (
            <Animated.View
                style={[{
                    transform: [
                        { translateX: item.position.x },
                        { translateY: item.position.y },
                        { rotate: shakeInterpolation }
                    ]
                }]}
                key={item.id}
            >
                <TouchableOpacity
                    style={itemStyle}
                    onPress={() => handleItemPress(item)}
                    disabled={item.matched}
                >
                    <Text style={textStyle}>{item.text}</Text>
                    {item.matched && (
                        <MaterialCommunityIcons
                            name="check-circle"
                            size={24}
                            color="#4CAF50"
                            style={styles.checkIcon}
                        />
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.timerContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color="#333" />
                        <Text style={styles.timerText}>{formatTime(timeLimit - timeSpent)}</Text>
                    </View>

                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: scoreAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [1, 1.2, 1]
                                    })
                                }
                            ]
                        }}
                    >
                        <ScoreCounter currentScore={score} maxScore={conceptPairs.length * 50 + 100} />
                    </Animated.View>
                </View>

                <Text style={styles.instructions}>
                    Empareja cada concepto con su definición correspondiente
                </Text>

                <ScrollView style={styles.gameArea}>
                    <View style={styles.itemsContainer}>
                        {items.map(item => renderItem(item))}
                    </View>
                </ScrollView>

            </View>

            {gameComplete &&
                <View style={[styles.infoContainer, tailwind('min-w-full')]}>
                    <Animated.View style={{ transform: [{ scale: scoreScale }] }}>
                        <View style={styles.completionBanner}>
                            <Text style={styles.completionText}>¡Actividad Completada!</Text>
                        </View>
                        <Text style={styles.scoreText}>Puntuación: {score}</Text>

                        <CustomButton
                            title='Continuar'
                            neonEffect={true}
                            onPress={() => {
                                actions.nextActivityType();
                                actions.reset();
                                router.push('/features/(tabs)/one');
                            }}
                        />
                    </Animated.View>
                </View>}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoContainer: {
        justifyContent: 'space-between',
        marginBottom: 8
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
    },
    timerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 16,
        marginBottom: 8,
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        color: '#555',
        fontWeight: '500',
    },
    gameArea: {
        flex: 1,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
    },
    item: {
        width: 100,
        marginVertical: 4,
        padding: 6,
        borderRadius: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minHeight: 80,
        justifyContent: 'center',
    },
    conceptItem: {
        backgroundColor: '#E3F2FD',
        borderRightWidth: 4,
        borderRightColor: '#2196F3',
    },
    matchItem: {
        backgroundColor: '#F3E5F5',
        borderLeftWidth: 4,
        borderLeftColor: '#9C27B0',
    },
    selectedItem: {
        elevation: 5,
        transform: [{ scale: 1.05 }],
        borderWidth: 2,
        borderColor: '#FFC107',
    },
    matchedItem: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
        borderWidth: 2,
        opacity: 0.8,
    },
    itemText: {
        fontSize: 14,
        textAlign: 'center',
    },
    conceptText: {
        fontWeight: 'bold',
        color: '#1565C0',
    },
    matchText: {
        color: '#6A1B9A',
    },
    matchedText: {
        color: '#2E7D32',
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    completionBanner: {
        position: 'relative',
        bottom: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        padding: 6,
        borderRadius: 4,
        alignItems: 'center',
        width: '100%',
        textAlign: 'center',
        top: 10,
        paddingVertical: 10,
    },
    completionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 18,
        width: '100%',
        top: 10,
        textAlign: 'center',
    },
});

export default MatchingConceptsGame;