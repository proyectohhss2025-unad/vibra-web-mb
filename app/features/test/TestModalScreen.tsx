import TamaguiButton from "@/shared/components/ui/tamagui/TamaguiButton";
import useUser from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ImageBackground, ScrollView, StyleSheet, View, Platform } from "react-native";
import { ActivityIndicator, Checkbox, RadioButton, Surface, Text, TextInput } from "react-native-paper";
import api from '../../shared/services/api/api';
import { getSafeKeyObjectFromStorage } from "@/shared/utils/safe-token-storage";

type QuestionFromApi = {
    questionId: string;
    type: 'open' | 'single' | 'multiple';
    text: string;
    options?: string[];
    points?: number;
    required?: boolean;
};

type TestFromApi = {
    _id: string;
    testId: string;
    title: string;
    description: string;
    questions: QuestionFromApi[];
};

const { width, height } = Dimensions.get('window');

const TestModalScreen = () => {
    const { user } = useUser();
    const router = useRouter();
    const { testId } = useLocalSearchParams<{ testId: string }>();
    const [testData, setTestData] = useState<TestFromApi | null>(null);
    const [questions, setQuestions] = useState<QuestionFromApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [saving, setSaving] = useState(false);

    // Cargar el test desde la API
    useEffect(() => {
        const fetchTest = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/tests/by-testid/${testId}`);
                if (response?.data) {
                    setTestData(response.data);
                    setQuestions(response.data.questions || []);
                }
            } catch (error) {
                console.error('Error fetching test questions:', error);
            } finally {
                setLoading(false);
            }
        };
        if (testId) fetchTest();
    }, [testId]);

    const getUserId = async () => {
        if (Platform.OS === 'web') {
            return getSafeKeyObjectFromStorage('userId');
        } else {
            return await AsyncStorage.getItem('userId');
        }
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            const currentQuestion = questions[currentIndex];
            if (answers[currentQuestion.questionId]) {
                setCurrentIndex(currentIndex + 1);
            }
        } else {
            setSaving(true);
            await AsyncStorage.setItem(`test-${testId}-answers`, JSON.stringify(answers));

            const userId = await getUserId();
            console.log('UserId for pretest:', userId);

            try {
                const response = await api.post("/api/pretests/save", {
                    testId,
                    userId: userId,
                    responses: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
                });

                if (response) {
                    console.log("Respuestas enviadas correctamente");
                    router.back();
                }
            } catch (error) {
                console.error('Error saving test responses:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const renderQuestion = () => {
        const question = questions[currentIndex];
        if (!question) return null;

        switch (question.type) {
            case "open":
                return (
                    <TextInput
                        mode="outlined"
                        label={question.text}
                        value={answers[question.questionId] || ""}
                        onChangeText={(text) => handleAnswerChange(question.questionId, text)}
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                    />
                );
            case "single":
                return (
                    <RadioButton.Group onValueChange={(value) => handleAnswerChange(question.questionId, value)} value={answers[question.questionId] || ""}>
                        {question.options?.map((option: string) => (
                            <RadioButton.Item
                                style={styles.radioItem}
                                key={option}
                                label={option}
                                value={option}
                                labelStyle={styles.optionLabel}
                            />
                        ))}
                    </RadioButton.Group>
                );
            case "multiple":
                return (
                    <View>
                        {question.options?.map((option: string) => (
                            <Checkbox.Item
                                style={styles.checkboxItem}
                                key={option}
                                label={option}
                                status={answers[question.questionId]?.includes(option) ? "checked" : "unchecked"}
                                onPress={() => {
                                    const currentAnswers = answers[question.questionId] || [];
                                    const newAnswers = currentAnswers.includes(option)
                                        ? currentAnswers.filter((a: string) => a !== option)
                                        : [...currentAnswers, option];
                                    handleAnswerChange(question.questionId, newAnswers);
                                }}
                                labelStyle={styles.optionLabel}
                            />
                        ))}
                    </View>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <ImageBackground
                source={require("../../assets/sponsors/fondo_vibra_new.jpg")}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator animating={true} size="large" color="#6200ee" />
                    <Text style={{ color: 'white', marginTop: 16 }}>Cargando test...</Text>
                </View>
            </ImageBackground>
        );
    }

    if (!testData || questions.length === 0) {
        return (
            <ImageBackground
                source={require("../../assets/sponsors/fondo_vibra_new.jpg")}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.loadingOverlay}>
                    <Text style={{ color: 'white', fontSize: 16 }}>No se encontraron preguntas para este test</Text>
                    <TamaguiButton
                        variantColor="blue"
                        onPress={() => navigation.back()}
                        title="Volver"
                    />
                </View>
            </ImageBackground>
        );
    }

    const currentQuestion = questions[currentIndex];
    const canProceed = currentIndex >= questions.length - 1 || !!answers[currentQuestion?.questionId];

    return (
        <ImageBackground
            source={require("../../assets/sponsors/fondo_vibra_new.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Surface style={styles.card}>
                    <Text variant="headlineSmall" style={styles.questionText}>
                        {currentQuestion?.text}
                    </Text>
                    {renderQuestion()}
                    <TamaguiButton
                        variantColor="red"
                        onPress={handleNext}
                        disabled={!canProceed && currentIndex < questions.length - 1}
                        style={styles.button}
                        title={
                            saving
                                ? "Guardando..."
                                : currentIndex < questions.length - 1
                                    ? "Siguiente"
                                    : "Finalizar"
                        }
                    />
                </Surface>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        elevation: 4,
        marginHorizontal: 16,
        paddingBottom: 50,
    },
    questionText: {
        marginBottom: 24,
        textAlign: 'center',
        color: '#1a1a1a',
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 16,
    },
    radioItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginVertical: 4,
        borderRadius: 8,
        padding: 8,
    },
    checkboxItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginVertical: 4,
        borderRadius: 8,
        padding: 8,
    },
    optionLabel: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    button: {
        top: 30,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#6200ee',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TestModalScreen;
