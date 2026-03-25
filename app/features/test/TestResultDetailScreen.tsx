import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useTailwind } from 'tailwind-rn';
import api from '../../shared/services/api/api';
import CustomButton from '../../shared/components/ui/CustomButton';

type TestResult = {
    _id: string;
    testId: string;
    userId: any;
    totalScore?: number;
    responses: { questionId: string; answer: any; points: number }[];
};

const TestResultDetailScreen = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const navigation = useNavigation();
    const { resultId } = useLocalSearchParams<{ resultId: string }>();
    const [result, setResult] = useState<TestResult | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchResult = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/pretest/result/${resultId}`);
            if (response) {
                setResult(response.data);
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
                    <Text style={{ textAlign: 'center', marginTop: 30 }} variant="titleLarge">{result.testId}-{result.userId?.username}</Text>
                    <Text style={{ textAlign: 'center' }} variant="titleSmall">Puntaje Total: {result.totalScore ?? 0}</Text>
                </View>
                {result.responses?.map((response, index) => (
                    <Card key={index + 1} style={{ marginBottom: 12 }}>
                        <Card.Title title={`Pregunta: ${response.questionId}`} subtitle={`Puntos: ${response.points}`} />
                        <Card.Content>
                            <Text>Respuesta: {JSON.stringify(response.answer)}</Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <CustomButton
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
        //backgroundColor: 'white',
        elevation: 8,
    },
});

export default TestResultDetailScreen;
