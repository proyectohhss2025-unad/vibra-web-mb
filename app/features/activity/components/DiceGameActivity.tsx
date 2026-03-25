import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '@/shared/components/ui/CustomButton';
import useActivityStore from '@/shared/store/activity.store';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Interfaz para las preguntas configurables del juego de dados
 */
interface DiceQuestion {
    id: string;
    questionText: string;
    diceValue: number; // Valor del dado asociado a esta pregunta (1-6)
    type: 'open' | 'multiple';
    options?: string[];
    correctAnswer: string;
}

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

/**
 * Propiedades del componente DiceGameActivity
 */
interface DiceGameActivityProps {
    studentId: string;
    studentName: string;
    questions: DiceQuestion[];
    onComplete: (result: GameResult) => void;
}

/**
 * Componente para la actividad de juego de dados
 * @param {DiceGameActivityProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
const DiceGameActivity: React.FC<DiceGameActivityProps> = ({
    studentId,
    studentName,
    questions,
    onComplete
}) => {
    // Estados del componente
    const [diceValue, setDiceValue] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<DiceQuestion | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [gamePhase, setGamePhase] = useState<'ready' | 'rolling' | 'question' | 'result'>('ready');
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<GameResult | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Referencias para animaciones
    const spinValue = useRef(new Animated.Value(0)).current;
    const bounceValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Store de actividad
    const { actions } = useActivityStore();

    // Componentes de dados para cada valor
    const renderDice = (value: number) => {
        return (
            <View style={styles.diceImageContainer}>
                <View style={styles.diceShape}>
                    {value === 1 && <View style={[styles.diceDot, styles.centerDot]} />}

                    {value >= 2 && (
                        <>
                            <View style={[styles.diceDot, styles.topLeftDot]} />
                            <View style={[styles.diceDot, styles.bottomRightDot]} />
                        </>
                    )}

                    {value >= 3 && <View style={[styles.diceDot, styles.centerDot]} />}

                    {value >= 4 && (
                        <>
                            <View style={[styles.diceDot, styles.topRightDot]} />
                            <View style={[styles.diceDot, styles.bottomLeftDot]} />
                        </>
                    )}

                    {value === 6 && (
                        <>
                            <View style={[styles.diceDot, styles.middleLeftDot]} />
                            <View style={[styles.diceDot, styles.middleRightDot]} />
                        </>
                    )}
                </View>
            </View>
        );
    };

    /**
     * Maneja el lanzamiento del dado
     */
    const handleRollDice = () => {
        setGamePhase('rolling');
        setError('');

        // Resetear animaciones
        spinValue.setValue(0);
        bounceValue.setValue(0);
        scaleValue.setValue(1);

        // Secuencia de animaciones para un efecto más dinámico
        Animated.parallel([
            // Animación de giro
            Animated.timing(spinValue, {
                toValue: 10, // Múltiples giros
                duration: 1500,
                useNativeDriver: true
            }),
            // Animación de escala pulsante
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.2,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(scaleValue, {
                    toValue: 0.8,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(scaleValue, {
                    toValue: 1.1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]),
            // Animación de rebote al final
            Animated.sequence([
                Animated.delay(1200),
                Animated.spring(bounceValue, {
                    toValue: 1,
                    friction: 4,
                    tension: 10,
                    useNativeDriver: true
                })
            ])
        ]).start();

        // Generar valor aleatorio del dado después de un tiempo
        setTimeout(() => {
            const newValue = Math.floor(Math.random() * 6) + 1;
            setDiceValue(newValue);

            // Buscar la pregunta correspondiente al valor del dado
            const matchingQuestion = questions.find(q => q.diceValue === newValue);

            if (matchingQuestion) {
                setCurrentQuestion(matchingQuestion);
                setGamePhase('question');
                setStartTime(Date.now());
            } else {
                // Si no hay pregunta para este valor, permitir lanzar de nuevo
                setGamePhase('ready');
                setError('No hay pregunta para este valor. ¡Lanza de nuevo!');
            }

            // Resetear animaciones
            spinValue.setValue(0);
            bounceValue.setValue(0);
        }, 1800);
    };

    /**
     * Maneja el envío de la respuesta
     */
    const handleSubmitAnswer = () => {
        if (!currentQuestion) return;

        // Validar que haya una respuesta
        if (currentQuestion.type === 'open' && !answer.trim()) {
            setError('Por favor escribe tu respuesta');
            return;
        }

        if (currentQuestion.type === 'multiple' && !selectedOption) {
            setError('Por favor selecciona una respuesta');
            return;
        }

        const userAnswer = currentQuestion.type === 'open' ? answer : selectedOption;
        const responseTime = (Date.now() - startTime) / 1000; // Convertir a segundos
        const isCorrect = currentQuestion.type === 'open'
            ? answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
            : selectedOption === currentQuestion.correctAnswer;

        // Crear objeto de resultado
        const gameResult: GameResult = {
            studentId,
            studentName,
            diceValue: diceValue!,
            questionId: currentQuestion.id,
            answer: userAnswer,
            isCorrect,
            responseTime,
            points: isCorrect ? diceValue! : 0, // Puntos basados en el valor del dado si es correcto
            timestamp: Date.now()
        };

        // Guardar resultado
        setResult(gameResult);
        setGamePhase('result');

        // Añadir respuesta al store de actividad
        actions.addResponse({
            questionId: currentQuestion.id,
            isCorrect,
            points: isCorrect ? diceValue! : 0,
            responseTime
        });
    };

    /**
     * Maneja el reinicio del juego
     */
    const handlePlayAgain = () => {
        setDiceValue(null);
        setCurrentQuestion(null);
        setAnswer('');
        setSelectedOption('');
        setGamePhase('ready');
        setError('');

        // Si hay un resultado, enviarlo antes de reiniciar
        if (result) {
            onComplete(result);
            setResult(null);
        }
    };

    // Estilos de animación para el dado
    const spin = spinValue.interpolate({
        inputRange: [0, 10],
        outputRange: ['0deg', '3600deg']
    });

    const bounce = bounceValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20]
    });

    return (
        <View style={styles.container}>
            {/* Encabezado con información del estudiante */}
            <View style={styles.header}>
                <View style={styles.studentInfo}>
                    <Ionicons name="person-circle" size={24} color="#4F46E5" />
                    <Text style={styles.studentName}>{studentName}</Text>
                </View>
                {diceValue && (
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Puntos posibles:</Text>
                        <Text style={styles.scoreValue}>{diceValue}</Text>
                    </View>
                )}
            </View>

            {/* Contenido principal según la fase del juego */}
            <View style={styles.content}>
                {gamePhase === 'ready' && (
                    <View style={styles.diceContainer}>
                        <Text style={styles.instructionText}>¡Lanza el dado para obtener una pregunta!</Text>
                        <TouchableOpacity onPress={handleRollDice} style={styles.diceButton}>
                            <MaterialCommunityIcons name="dice-multiple" size={80} color="#4F46E5" />
                        </TouchableOpacity>
                        <CustomButton
                            title="Lanzar dado"
                            variantColor="blue"
                            neonEffect={true}
                            onPress={handleRollDice}
                            icon="casino"
                            style={styles.rollButton}
                        />
                    </View>
                )}

                {gamePhase === 'rolling' && (
                    <View style={styles.diceContainer}>
                        <Animated.View
                            style={[
                                styles.rollingDice,
                                {
                                    transform: [
                                        { rotate: spin },
                                        { translateY: bounce },
                                        { scale: scaleValue }
                                    ]
                                }
                            ]}
                        >
                            <View style={styles.animatedDiceContainer}>
                                {[1, 2, 3, 4, 5, 6].map((value) => (
                                    <Animated.View
                                        key={value}
                                        style={[styles.animatedDice, { opacity: Math.random() }]}
                                    >
                                        <>{renderDice(value)}</>
                                    </Animated.View>
                                ))}
                            </View>
                        </Animated.View>
                        <Text style={styles.rollingText}>Lanzando...</Text>
                    </View>
                )}

                {gamePhase === 'question' && currentQuestion && (
                    <View style={styles.questionContainer}>
                        <View style={styles.diceResult}>
                            <>{renderDice(diceValue || 1)}</>
                            <Text style={styles.diceValueText}>Obtuviste: {diceValue}</Text>
                        </View>

                        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

                        {currentQuestion.type === 'multiple' ? (
                            <View style={styles.optionsContainer}>
                                {currentQuestion.options?.map((option, index) => (
                                    <TouchableOpacity
                                        key={index+1}
                                        style={[
                                            styles.optionButton,
                                            selectedOption === option && styles.selectedOption
                                        ]}
                                        onPress={() => setSelectedOption(option)}
                                    >
                                        <Text style={styles.optionText}>{option}</Text>
                                        {selectedOption === option && (
                                            <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Tu respuesta:</Text>
                                <View style={styles.textInputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Escribe tu respuesta aquí..."
                                        multiline
                                        numberOfLines={4}
                                        value={answer}
                                        onChangeText={setAnswer}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        )}

                        {error ? (
                            <Text style={styles.errorText}>
                                <Ionicons name="information-circle" size={22} color="red" /> <>{error}</>
                            </Text>
                        ) : null}

                        <CustomButton
                            title="Enviar respuesta"
                            variantColor="blue"
                            neonEffect={true}
                            onPress={handleSubmitAnswer}
                            icon="send"
                            style={styles.submitButton}
                        />
                    </View>
                )}

                {gamePhase === 'result' && result && (
                    <View style={styles.resultContainer}>
                        <LinearGradient
                            colors={result.isCorrect ? ['#34D399', '#10B981'] : ['#F87171', '#EF4444']}
                            style={styles.resultCard}
                        >
                            <View style={styles.resultIconContainer}>
                                <Ionicons
                                    name={result.isCorrect ? "checkmark-circle" : "close-circle"}
                                    size={60}
                                    color="white"
                                />
                            </View>

                            <Text style={styles.resultTitle}>
                                {result.isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
                            </Text>

                            <View style={styles.resultDetails}>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Puntos obtenidos:</Text>
                                    <Text style={styles.resultValue}>{result.points}</Text>
                                </View>

                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Tiempo de respuesta:</Text>
                                    <Text style={styles.resultValue}>{result.responseTime.toFixed(1)} seg</Text>
                                </View>
                            </View>

                            <CustomButton
                                title="Jugar de nuevo"
                                variantColor={result.isCorrect ? "green" : "blue"}
                                neonEffect={true}
                                onPress={handlePlayAgain}
                                icon="refresh"
                                style={styles.playAgainButton}
                            />
                        </LinearGradient>
                    </View>
                )}
            </View>

            {/* Mensaje de error general */}
            {error && gamePhase === 'ready' && (
                <Text style={styles.generalErrorText}>{error}</Text>
            )}
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    studentName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginRight: 4,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    diceContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    instructionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 24,
    },
    diceButton: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        marginBottom: 24,
    },
    rollingDice: {
        marginBottom: 24,
    },
    animatedDiceContainer: {
        width: 100,
        height: 100,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    animatedDice: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    rollingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4F46E5',
        marginTop: 16,
    },
    rollButton: {
        width: width * 0.6,
        maxWidth: 300,
    },
    questionContainer: {
        width: '100%',
        padding: 16,
    },
    diceResult: {
        alignItems: 'center',
        marginBottom: 24,
    },
    diceImageContainer: {
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diceShape: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 5,
        borderColor: '#4F46E5',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    diceDot: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4F46E5',
    },
    centerDot: {
        top: '50%',
        left: '50%',
        transform: [{ translateX: -8 }, { translateY: -8 }],
    },
    topLeftDot: {
        top: 12,
        left: 12,
    },
    topRightDot: {
        top: 12,
        right: 12,
    },
    middleLeftDot: {
        top: '50%',
        left: 12,
        transform: [{ translateY: -8 }],
    },
    middleRightDot: {
        top: '50%',
        right: 12,
        transform: [{ translateY: -8 }],
    },
    bottomLeftDot: {
        bottom: 12,
        left: 12,
    },
    bottomRightDot: {
        bottom: 12,
        right: 12,
    },
    diceValueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4F46E5',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    selectedOption: {
        backgroundColor: '#E0E7FF',
        borderWidth: 1,
        borderColor: '#4F46E5',
    },
    optionText: {
        fontSize: 16,
        color: '#1F2937',
        flex: 1,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
    },
    textInputContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    input: {
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        color: '#1F2937',
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    generalErrorText: {
        color: '#EF4444',
        marginTop: 16,
        textAlign: 'center',
    },
    submitButton: {
        width: '100%',
        marginTop: 16,
    },
    resultContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    resultCard: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    resultIconContainer: {
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 24,
        textAlign: 'center',
    },
    resultDetails: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    resultLabel: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    playAgainButton: {
        width: '100%',
    },
});

export default DiceGameActivity;