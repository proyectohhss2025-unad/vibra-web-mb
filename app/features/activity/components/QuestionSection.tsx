import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Question from '@shared/types/activity';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import useActivityStore from '@shared/store/activity.store';

interface QuestionSectionProps {
    questions: Question;
    onSubmit: (answers: Record<string, string>) => void;
    isLastQuestion?: boolean;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ questions, onSubmit, isLastQuestion = false }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [openAnswer, setOpenAnswer] = useState('');
    const [error, setError] = useState('');
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const { actions, responses } = useActivityStore();
    const startTime = Date.now();

    // Animación para el modal de resultados
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setSelectedAnswers({});
        setOpenAnswer('');
        setError('');
    }, [questions]);

    // Función para mostrar el modal de resultados
    const showResultsModal = () => {
        setIsCompleted(true);

        // Calcular tiempo total y puntuación
        const elapsedTime = Math.round((Date.now() - startTime) / 1000);
        setTimeSpent(elapsedTime);

        // Calcular puntuación basada en respuestas correctas
        const totalScore = responses.reduce((total: number, response: any) => {
            return total + (response.points || 0);
        }, 0);
        setScore(totalScore);

        // Animar la aparición del modal
        Animated.timing(successAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    // Formatear tiempo en minutos:segundos
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = () => {
        if (questions?.type === 'open' && !openAnswer.trim()) {
            setError('Por favor escribe tu respuesta');
            return;
        }

        if (questions?.type === 'multiple' && !selectedAnswers[questions?.id!]) {
            setError('Por favor selecciona una respuesta');
            return;
        }

        const answers = questions?.type === 'multiple'
            ? selectedAnswers
            : { [questions?.id!]: openAnswer };

        const responseTime = (Date.now() - startTime) / 1000; // Convertir a segundos
        const isCorrect = questions?.type === 'multiple'
            ? selectedAnswers[questions?.id!] === questions?.correctAnswer
            : openAnswer.toLowerCase().trim() === questions?.correctAnswer?.toLowerCase().trim();

        // Aseguramos que la respuesta tenga todos los campos necesarios para el cálculo de puntaje
        actions.addResponse({
            questionId: questions?.id!,
            isCorrect,
            points: isCorrect ? 1 : 0,
            responseTime
        });

        console.log("Respuesta agregada:", {
            questionId: questions?.id!,
            isCorrect,
            points: isCorrect ? 1 : 0,
            responseTime
        });

        console.table("Answers:", answers);
        console.log("Submitting answer for question ID:", questions?.id);
        console.warn("Es última pregunta:", isLastQuestion);

        // Si es la última pregunta, mostrar el modal de resultados
        if (isLastQuestion) {
            console.log("Procesando última pregunta antes de enviar...");
            showResultsModal();
            return;
        }

        onSubmit(answers);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {!isCompleted && (<>
                <Text style={styles.questionText}>{questions?.questionText}</Text>

                {questions?.type === 'multiple' ? (
                    <View style={styles.optionsContainer}>
                        {questions?.options?.map((option: any, index: any) => (
                            <TouchableOpacity
                                key={index + 1}
                                style={[
                                    styles.optionButton,
                                    selectedAnswers[questions?.id!] === option && styles.selectedOption
                                ]}
                                onPress={() => setSelectedAnswers({ [questions?.id!]: option })}
                            >
                                <Text style={styles.optionText}>{option}...</Text>
                                {selectedAnswers[questions?.id!] === option && (
                                    <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe tu respuesta aquí..."
                        multiline
                        numberOfLines={4}
                        value={openAnswer}
                        onChangeText={setOpenAnswer}
                        textAlignVertical="top"
                    />
                )}

                {error ? <Text style={styles.errorText}><Ionicons style={{ top: 6 }} name="information-circle" size={22} color="red" /> {error}</Text> : null}

                <TamaguiButton
                    title="Continuar"
                    variantColor='blue'
                    neonEffect={true}
                    style={styles.submitButtonText}
                    onPress={handleSubmit}
                    icon="arrow-forward"
                    disabled={questions?.type === 'multiple' && !selectedAnswers[questions?.id!]}
                />
            </>)}
            {/* Modal de resultados cuando se completa la actividad */}
            {isCompleted && (
                <View style={styles.resultsCard}>
                    <MaterialIcons name="check-circle" size={80} color="#10B981" />
                    <Text style={styles.resultsTitle}>¡Actividad Completada!</Text>
                    <Text style={styles.resultsScore}>Puntuación: {score}</Text>
                    <Text style={styles.resultsTime}>
                        Tiempo: {formatTime(timeSpent)}
                    </Text>
                    <Text style={styles.resultsCorrect}>
                        Respuestas correctas: {responses.filter((r: any) => r.isCorrect).length} de {responses.length}
                    </Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 20,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        color: '#1F2937',
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        padding: 10,
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
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3353E4FF',
        padding: 16,
        borderRadius: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 14,
        textAlign: 'center',
    },
    // Estilos para el modal de resultados
    resultsOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(16, 185, 129, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    resultsCard: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
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
        marginBottom: 12,
    },
    resultsCorrect: {
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

export default QuestionSection;