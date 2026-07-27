import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useTailwind } from 'tailwind-rn';
import api from '@shared/services/api/api';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';

type TestResult = {
    _id: string;
    testId: string;
    userId: any;
    totalScore?: number;
    responses: { questionId: string; answer: any; points: number }[];
};

type TestName = {
    testId: string;
    title: string;
};

const TestResultDetailScreen = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const { resultId } = useLocalSearchParams<{ resultId: string }>();
    const [result, setResult] = useState<TestResult | null>(null);
    const [testTitles, setTestTitles] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const fetchResult = async () => {
        setLoading(true);
        try {
            // Obtener detalle del resultado
            const response = await api.get(`/api/pretests/result/${resultId}`);
            if (response) {
                const data = response.data;
                setResult(data);

                // Obtener nombre del test asociado
                if (data?.testId) {
                    try {
                        const testResponse = await api.get(`/api/tests/by-testid/${data.testId}`);
                        if (testResponse?.data) {
                            setTestTitles({ [data.testId]: testResponse.data.title });
                        }
                    } catch {
                        // Si falla, mostramos el testId nomás
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching result detail:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResult();
    }, [resultId]);

    if (loading || !result) {
        return <ActivityIndicator animating={true} style={{ marginTop: 20 }} />;
    }

    const testTitle = testTitles[result.testId] || result.testId;
    const userName = typeof result.userId === 'object' ? result.userId?.username : result.userId;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <TouchableOpacity>
                    <Image
                        source={require('../../assets/logo-vibra.png')}
                        style={[{ margin: 'auto', top: 30, alignItems: 'center', width: 100, height: 100, marginVertical: 'auto' }, tailwind('rounded-t-lg')]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                <View style={styles.header}></View>
                <View style={styles.headerContainer}>
                    <Text style={{ textAlign: 'center', marginTop: 30 }} variant="titleLarge">
                        {testTitle}
                    </Text>
                    <Text style={{ textAlign: 'center' }} variant="titleSmall">
                        Usuario: {userName}
                    </Text>
                    <Text style={{ textAlign: 'center', marginTop: 8 }} variant="titleSmall">
                        Puntaje Total: {result.totalScore ?? 0}
                    </Text>
                </View>
                {result.responses?.map((response, index) => (
                    <Card key={index + 1} style={{ marginBottom: 12 }}>
                        <Card.Title title={`Pregunta: ${response.questionId}`} subtitle={`Puntos: ${response.points}`} />
                        <Card.Content>
                            <Text>Respuesta: {Array.isArray(response.answer) ? response.answer.join(', ') : String(response.answer)}</Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TamaguiButton
                    icon="arrow-left"
                    style={{ marginRight: 16 }}
                    neonEffect={true}
                    title='Volver a la lista'
                    variantColor="blue"
                    onPress={() => router.back()}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerContainer: {
        textAlign: 'center',
        elevation: 4,
        marginBottom: 16,
    },
    header: {
        color: 'white',
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
    },
    buttonContainer: {
        padding: 16,
        elevation: 8,
    },
});

export default TestResultDetailScreen;
