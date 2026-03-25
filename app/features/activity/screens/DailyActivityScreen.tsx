import useUser from '@/context/UserContext';
import useActivityStore from '@/shared/store/activity.store';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import ErrorScreen from '../../../shared/components/common/ErrorScreen';
import MediaPlayer from '../../../shared/components/media/MediaPlayer';
import ProgressBarII from '../../../shared/components/ui/ProgressBarNew';
import calculateScore, { calculateMaxScore } from '../../../shared/utils/score-utils';
import MatchingConceptsGame from '../components/MatchingConceptsGame';
import QuestionSection from '../components/QuestionSection';
import ScoreCounter from '../components/ScoreCounter';
import WordSearchGame from '../components/WordSearchGame';
import { useDailyActivity, useSubmitResponse } from '../hooks/activity';
import CustomButton from '@/shared/components/ui/CustomButton';
import EmotionBoxScreen from './EmotionBoxScreen';
import DiceGameActivity from '../components/DiceGameActivity';
import DiceGameScreen from './DiceGameScreen';

const DailyActivityScreen = () => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const { data, isLoading, error } = useDailyActivity();
    const { mutate } = useSubmitResponse();
    const { currentStep, responses, activityType, actions } = useActivityStore();
    const startTime = 60;
    const [timeLeft, setTimeLeft] = useState(startTime);
    const currentScore = calculateScore(responses as any);
    const maxScore = calculateMaxScore(data?.activity?.questions?.length || 0);
    const [animate, setAnimate] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animate) {
            Animated.timing(animation, {
                toValue: 1, // Valor final de la animación
                duration: 500, // Duración en milisegundos
                useNativeDriver: true, // Importante para rendimiento
            }).start(() => setAnimate(false)); // Reset al finalizar
        } else {
            Animated.timing(animation, {
                toValue: 0, // Regresa al valor inicial
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [animate, animation]);

    const escala = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.8], // Escala de 1 a 1.5
    });

    /*useEffect(() => {
        console.log("data received:", data);
        if (data) {
            console.log("Data received:", data.activity);
            console.log("Current Step:", currentStep);
            actions.reset();
        }
    }, [data]);*/

    const handleSubmit = async (answers: Record<string, string>) => {
        if (!data) return;

        console.log("Submitting user:", user?.id);
        const responseDto: any = {
            activityId: data.activity?._id,
            userId: user.id,
            answers: Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
                responseTime: Date.now() - startTime
            }))
        };

        // Verificar si es la última pregunta del tipo 'Question'
        // Aseguramos que la comparación sea exacta para detectar correctamente la última pregunta
        const isLastQuestion = currentStep === data.activity.questions?.length - 1;

        console.log("Submitting responseDto:", responseDto);
        console.log("Submitting isLastQuestion:", isLastQuestion, "currentStep:", currentStep, "questions length:", data.activity.questions?.length);

        mutate(responseDto, {
            onSuccess: () => {
                console.log("CurrentStep:", currentStep);
                if (isLastQuestion && activityType === 'Question') {
                    console.log("Última pregunta confirmada, preparando transición a siguiente actividad...");
                    // Si es la última pregunta, mostrar alerta con opción para continuar a la siguiente actividad
                    if (Platform.OS !== 'web') {
                        Alert.alert(
                            'Actividad completada',
                            '¡Has completado todas las preguntas! ¿Deseas continuar con la siguiente actividad?',
                            [
                                {
                                    text: 'Continuar',
                                    onPress: () => {
                                        actions.nextActivityType(); // Cambiar al siguiente tipo de actividad (WordSearch)
                                        actions.reset(); // Reiniciar el contador de pasos
                                    }
                                },
                                {
                                    text: 'Salir',
                                    onPress: () => router.push('/features/(tabs)/one'),
                                    style: 'cancel'
                                }
                            ]
                        );
                    } else {
                        // Para web, podemos mostrar un mensaje y cambiar automáticamente

                        actions.nextActivityType();
                        actions.reset();
                    }
                } else {
                    // Si no es la última pregunta, simplemente avanzar al siguiente paso
                    console.log("No es la última pregunta, avanzando al siguiente paso...", currentStep);
                    actions.nextStep();

                    // Verificamos si después de avanzar hemos llegado al final
                    // Importante: Verificamos con currentStep + 1 porque el estado aún no se ha actualizado
                    const nextStep = currentStep + 1;
                    if (nextStep >= data.activity.questions?.length && activityType === 'Question') {
                        console.log("Llegamos a la última pregunta, preparando transición...");
                        // Forzamos la actualización para mostrar el botón de continuar
                        // Esto asegura que se muestre la UI de transición
                    }
                }
            },
            onError: () => Alert.alert('Error al enviar respuestas')
        });
    };

    if (isLoading) return <ActivityIndicator size="large" />;
    if (error) return <ErrorScreen message={error.message} />;

    if (!data || !data.activity) return <ErrorScreen onRetry={() => { router.back() }} message={'Por favor configure una actividad para el día!'} />;

    return (
        <SafeAreaView style={tailwind("flex-1 p-2 bg-gray-50 w-full px-4")}>
            <ScrollView contentContainerStyle={tailwind("flex-grow")} showsVerticalScrollIndicator={true}>
                <View style={styles.container}>
                    {activityType === 'Question' && <>
                        {currentStep} - {data.activity?.questions?.length}
                        <View style={styles.buttonContainer}>
                            {currentStep < data.activity?.questions?.length && (<>
                                <View style={styles.headerContainer}>
                                    <Text style={[{ fontSize: 20, textAlign: 'center' }, tailwind('mb-2 font-semibold')]}>Emoción: {data.activity?.emotion?.name}</Text>
                                    <ProgressBarII total={data.activity?.resources?.length - 1} current={currentStep} />
                                </View>
                                <View style={styles.listContainer}>
                                    <MediaPlayer
                                        resource={data.activity?.resources[currentStep]}
                                        onComplete={() => currentStep < data.activity?.resources?.length && actions.nextStep()}
                                    />
                                </View>

                                <QuestionSection
                                    questions={data.activity?.questions[currentStep]}
                                    onSubmit={handleSubmit}
                                    isLastQuestion={currentStep === data.activity?.questions?.length - 1}
                                />
                            </>
                            )}
                            <View style={styles.scoreContainer}>
                                <ScoreCounter
                                    currentScore={currentScore}
                                    maxScore={maxScore}
                                />
                            </View>
                            {(currentStep >= data.activity?.questions?.length - 1) && (
                                <View style={[tailwind('mt-4 flex items-center justify-center'), styles.transitionButtonContainer]}>
                                    <Text style={tailwind('text-center mb-2 text-gray-700')}>¿Listo para la siguiente actividad?</Text>
                                    <View style={tailwind('py-2 px-4 rounded-lg')}>
                                        <CustomButton
                                            title="Continuar"
                                            variantColor='blue'
                                            neonEffect={true}
                                            onPress={() => {
                                                actions.nextActivityType();
                                                // actions.reset();
                                            }}
                                            icon="arrow-forward"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </>}

                    {activityType === 'WordSearch' &&
                        <View style={[styles.gameContainer, tailwind('mt-4 mb-6')]}>
                            <Text style={[styles.gameTitle, tailwind('text-xl font-bold mb-2')]}>Sopa de Letras</Text>
                            <Text style={[styles.gameDescription, tailwind('text-sm mb-4')]}>Encuentra todas las palabras ocultas en la cuadrícula para ganar puntos.</Text>
                            <WordSearchGame
                                words={['ESPERANZA', 'HONESTO', 'AMOR', 'EMPATIA', 'VIBRA', 'HUMILDAD']}
                                gridSize={9}
                                timeLimit={300}
                                activityId="word-search-activity"
                            />
                            <View style={[tailwind('mt-4 flex items-center justify-center'), styles.transitionButtonContainer]}>
                                <Text style={tailwind('text-center mb-2 text-gray-700')}>¿Listo para la siguiente actividad?</Text>
                                <View style={tailwind('bg-blue-500 py-2 px-4 rounded-lg')}>
                                    <CustomButton
                                        title="Continuar a Emparejar Conceptos"
                                        variantColor='blue'
                                        neonEffect={true}
                                        onPress={() => {
                                            actions.nextActivityType();
                                            //actions.reset();
                                        }}
                                        icon="arrow-forward"
                                    />
                                </View>
                            </View>
                        </View>}

                    {activityType === 'MatchingConcepts' &&
                        <View style={[styles.gameContainer, tailwind('mt-4 mb-6')]}>
                            <Text style={[styles.gameTitle, tailwind('text-xl font-bold mb-2')]}>Emparejar conceptos</Text>
                            <Text style={[styles.gameDescription, tailwind('text-sm mb-4')]}>Relaciona cada concepto con su definición correspondiente para ganar puntos.</Text>
                            <MatchingConceptsGame
                                conceptPairs={[
                                    { id: '1', concept: 'Vibra', match: 'App para captura de emociones' },
                                    { id: '2', concept: 'Actividad', match: 'Accion para medir emociones' },
                                    { id: '3', concept: 'Reto', match: 'Competencias de emociones' },
                                    { id: '4', concept: 'EPersonal', match: 'Eventos personales' },
                                    { id: '5', concept: 'Ranking', match: 'Nivel entre la comunidad' },
                                ]}
                                timeLimit={180}
                                activityId="matching-concepts-activity"
                            />
                            <View style={[tailwind('mt-4 flex items-center justify-center'), styles.transitionButtonContainer]}>
                                <Text style={tailwind('text-center mb-2 text-gray-700')}>¿Listo para la siguiente actividad?</Text>
                                <View style={tailwind('bg-blue-500 py-2 px-4 rounded-lg')}>
                                    <CustomButton
                                        title="Continuar a la caja de emociones"
                                        variantColor='blue'
                                        neonEffect={true}
                                        onPress={() => {
                                            actions.nextActivityType();
                                            //actions.reset();
                                        }}
                                        icon="arrow-forward"
                                    />
                                </View>
                            </View>
                        </View>}

                    {activityType === 'EmotionBox' &&
                        <View style={[styles.gameContainer, tailwind('mt-4 mb-6')]}>
                            <Text style={[styles.gameTitle, tailwind('text-xl font-bold mb-2')]}>Caja de emociones</Text>
                            <Text style={[styles.gameDescription, tailwind('text-sm mb-4')]}>Relaciona cada emocion con su respectivo emoticon.</Text>
                            <EmotionBoxScreen />
                            <View style={[tailwind('mt-4 flex items-center justify-center'), styles.transitionButtonContainer]}>
                                <Text style={tailwind('text-center mb-2 text-gray-700')}>¿Listo para la siguiente actividad?</Text>
                                <View style={tailwind('bg-blue-500 py-2 px-4 rounded-lg')}>
                                    <CustomButton
                                        title="Continuar a juego de dados"
                                        variantColor='blue'
                                        neonEffect={true}
                                        onPress={() => {
                                            actions.nextActivityType();
                                            //actions.reset();
                                        }}
                                        icon="arrow-forward"
                                    />
                                </View>
                            </View>
                        </View>}

                    {activityType === 'DiceGame' &&
                        <View style={[styles.gameContainer, tailwind('mt-4 mb-6')]}>
                            <Text style={[styles.gameTitle, tailwind('text-xl font-bold mb-2')]}>Juego de dados</Text>
                            <Text style={[styles.gameDescription, tailwind('text-sm mb-4')]}>Lanza los dados y acierta en las preguntas.</Text>
                            <DiceGameScreen />
                            <View style={[tailwind('mt-4 flex items-center justify-center'), styles.transitionButtonContainer]}>
                                <Text style={tailwind('text-center mb-2 text-gray-700')}>¿Has completado todas las actividades?</Text>
                                <View style={tailwind('bg-green-500 py-2 px-4 rounded-lg')}>
                                    <CustomButton
                                        title="Finalizar Actividades"
                                        variantColor='green'
                                        neonEffect={true}
                                        onPress={() => {
                                            actions.reset();
                                            router.push('/features/(tabs)/one');
                                        }}
                                        icon="check"
                                    />
                                </View>
                            </View>
                        </View>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 10,
    },
    headerContainer: {
        paddingVertical: 4,
        elevation: 4,
    },
    listContainer: {
        flex: 1,
        height: 220
    },
    buttonContainer: {
        padding: 4,
        elevation: 8,
    },
    scoreContainer: {
        marginVertical: 15,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gameContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    gameDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: 'tomato',
        borderRadius: 4,
    },
    transitionButtonContainer: {
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default DailyActivityScreen;