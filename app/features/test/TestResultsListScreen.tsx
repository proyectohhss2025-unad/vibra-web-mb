import useUser from '@/context/UserContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, List, Surface } from 'react-native-paper';
import { useTailwind } from 'tailwind-rn';
import api from '../../shared/services/api/api';
import CustomButton from '../../shared/components/ui/CustomButton';

type TestResult = {
    _id: string;
    testId: string;
    userId: string;
    totalScore?: number;
};

const TestResultsListScreen = () => {
    const tailwind = useTailwind();
    const { user } = useUser();
    const router = useRouter();
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/pretests/search/user/' + user?.id, {
                params: {
                    userId: user?.id,
                },
            });
            console.log(response.data);
            if (response) {
                setResults(response.data);
            }
        } catch (error) {
            console.error('Error fetching test results:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchResults();
    };

    const renderItem = ({ item }: { item: TestResult }) => (
        <Surface style={styles.card}>
            <List.Item
                title={`Test: ${item.testId}`}
                titleStyle={styles.itemTitle}
                description={`Puntaje Total: ${item.totalScore ?? 0}`}
                descriptionStyle={styles.itemDescription}
                onPress={() => router.push({
                    pathname: '/features/test/TestResultDetailScreen',
                    params: {
                        resultId: item._id
                    }
                })}
                right={props => <List.Icon {...props} icon="chevron-right" color="#4a90e2" />}
            />
        </Surface>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" color="#4a90e2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity>
                    <Image
                        source={require('../../assets/logo-vibra.png')}
                        style={[{ margin: 'auto', top: 30, alignItems: 'center', width: 100, height: 100, marginVertical: 'auto' }, tailwind('rounded-t-lg')]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <View style={styles.header}></View>
                <List.Subheader style={styles.header}>
                    Resultados del usuario: {user?.username}
                </List.Subheader>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={results}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4a90e2']}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            </View>
            <View style={styles.buttonContainer}>
                <CustomButton
                    neonEffect={true}
                    icon='arrow-left'
                    title='Volver a la lista de tests'
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
        paddingVertical: 16,
        elevation: 4,
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
    listContent: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: 'white',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        padding: 16,
        elevation: 8,
    },
});

export default TestResultsListScreen;
