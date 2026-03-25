import CustomButton from "@/shared/components/ui/CustomButton";
import useUser from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, RadioButton, Surface, Text, TextInput } from "react-native-paper";
import api from '../../shared/services/api/api';

const TEST_QUESTIONS: Record<string, any[]> = {
    "1": [
        { id: "q1", type: "open", text: "¿Te consideras un ser trasendental?" },
        { id: "q2", type: "single", text: "¿Cuál es el grupo en el que sientes que encajas?", options: ["5-7", "7-10", "10-14", "14-16"] },
        { id: "q3", type: "multiple", text: "¿Cuáles son los pensamientos mas cotidianos en tu vida estudiantil?", options: ["Frustracción", "Gratitud", "Miedo", "Celos"] },
    ],
    "2": [
        { id: "q1", type: "open", text: "¿Qué es la vibra y la sintonía?" },
        { id: "q2", type: "single", text: "¿Qué estados del caracter conocer?", options: ["Enojado", "Feliz", "Sonrojo", "Apenado"] },
    ],
    "3": [
        { id: "q1", type: "open", text: "¿Como te sientes hoy ante esta actividad emocional?" },
        { id: "q2", type: "multiple", text: "Que emociones estuvieron mas presentes en tus ultimas 48 horas", options: ["Ego", "Vanidad", "Orgullo", "Humildad"] },
    ],
};

const { width, height } = Dimensions.get('window');

const TestModalScreen = () => {
    const { user } = useUser();
    const navigation = useNavigation();
    const { testId } = useLocalSearchParams<{ testId: string }>();
    const questions = TEST_QUESTIONS[testId] || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            const currentQuestion = questions[currentIndex];
            if (answers[currentQuestion.id]) {
                setCurrentIndex(currentIndex + 1);
            }
        } else {
            await AsyncStorage.setItem(`test-${testId}-answers`, JSON.stringify(answers));

            const response = await api.post("/api/pretests/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId,
                    userId: user?.id,
                    responses: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
                }),
            });

            if (response) {
                console.log("Respuestas enviadas correctamente");
                navigation.goBack();
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
                        value={answers[question.id] || ""}
                        onChangeText={(text) => handleAnswerChange(question.id, text)}
                        style={styles.input}
                        theme={{ colors: { primary: '#6200ee' } }}
                    />
                );
            case "single":
                return (
                    <RadioButton.Group onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id] || ""}>
                        {question.options.map((option: string) => (
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
                        {question.options.map((option: string) => (
                            <Checkbox.Item
                                style={styles.checkboxItem}
                                key={option}
                                label={option}
                                status={answers[question.id]?.includes(option) ? "checked" : "unchecked"}
                                onPress={() => {
                                    const currentAnswers = answers[question.id] || [];
                                    const newAnswers = currentAnswers.includes(option) ? currentAnswers.filter((a: string) => a !== option) : [...currentAnswers, option];
                                    handleAnswerChange(question.id, newAnswers);
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

    return (
        <ImageBackground
            source={require("../../assets/sponsors/fondo_vibra_new.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Surface style={styles.card}>
                    <Text variant="headlineSmall" style={styles.questionText}>
                        {questions[currentIndex]?.text}
                    </Text>
                    {renderQuestion()}
                    <CustomButton
                        variantColor="red"
                        onPress={handleNext}
                        style={styles.button}
                        title={currentIndex < questions.length - 1 ? "Siguiente" : "Finalizar"}
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
    scrollContainer: {
        //flexGrow: 1,
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
