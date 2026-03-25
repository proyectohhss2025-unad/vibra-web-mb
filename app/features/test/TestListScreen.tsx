import useUser from '@/context/UserContext';
import api from '@/shared/services/api/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import CustomButton from "../../shared/components/ui/CustomButton";

const logoUnad = require('../../assets/sponsors/logo_unad.png');
const TESTS = [
    { id: "1", title: "Test de personalidad", description: "Test de ... ", started: true },
    { id: "2", title: "Test de tecnologia", description: "Test de conocimientos tecnológicos", started: false },
    { id: "3", title: "Test de cultura general", description: "Test de cultura general", started: false },
];

const TestListScreen = () => {
    const { user } = useUser();
    const tailwind = useTailwind();
    const [testList, setTestList] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
                    const newTestList = TESTS.map((test) => {
                        const result = response.data.find((r: any) => r.testId === test.id);
                        return {
                            ...test,
                            started: !!result,
                        };
                    });
                    setTestList(newTestList);
                }
            } catch (error) {
                console.error('Error fetching test results:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [TESTS]);

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
                <View style={tailwind('p-5 m-6')}>
                    <TouchableOpacity>
                        <Text style={tailwind('mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white')}>
                            Tests para Vibra
                        </Text>
                        <Image
                            source={logoUnad}
                            style={{ marginLeft: 200, width: 100, height: 56, marginTop: Platform.OS == 'android' ? 0 : -46 }}
                        />
                    </TouchableOpacity>
                    <Text style={tailwind('mb-3 font-normal text-lg mt-4')}>
                        Muestra tu vibra inicial a traves de estos sencillos test de emotividad.
                    </Text>
                    <TouchableOpacity
                        style={tailwind('inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')}
                    >
                        <Text style={tailwind('text-white')}>Leer mas acerca de los test en vibra</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={testList}
                    style={tailwind('max-w-full mx-2 rounded-lg')}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cardContainer}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <MaterialIcons name="school" size={24} color="#007AFF" style={styles.cardIcon} />
                                    <View style={styles.cardTextContainer}>
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                        <Text style={styles.cardDescription}>{item.description}</Text>
                                    </View>
                                    <View style={styles.cardButtonContainer}>
                                        {!item.started &&
                                            <CustomButton
                                                title="Iniciar"
                                                icon="play-circle-outline"
                                                iconPosition="left"
                                                variantColor="blue"
                                                neonEffect={true}
                                                style={styles.actionButton}
                                                onPress={() => router.push({
                                                    pathname: "/features/test/TestModalScreen",
                                                    params: { testId: item.id }
                                                })}
                                            />
                                        }
                                        {item.started &&
                                            <CustomButton
                                                title="Ver"
                                                icon="check-circle"
                                                iconPosition="left"
                                                variantColor="green"
                                                neonEffect={true}
                                                style={styles.actionButton}
                                                onPress={() => router.push({
                                                    pathname: "/features/test/TestResultsListScreen",
                                                    params: { testId: item.id }
                                                })}
                                            />
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <View style={styles.buttonContainer}>
                <CustomButton
                    style={{ fontSize: 22 }}
                    icon={"arrow-right"}
                    iconPosition="right"
                    iconSize={24}
                    neonEffect={true}
                    title="Continuar"
                    variantColor="red"
                    onPress={() => router.push("/features/(tabs)/one")}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 8,
    },
    headerContainer: {
        paddingVertical: 10,
        borderRadius: 15,
        marginBottom: 10,
    },
    header: {
        color: '#333',
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 4,
        top: -30,
    },
    listContent: {
        padding: 16,
    },
    cardContainer: {
        marginHorizontal: 6,
        marginVertical: 6,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 20,
    },
    card: {
        marginBottom: 0,
        borderRadius: 16,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    cardIcon: {
        marginRight: 16,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        padding: 10,
        borderRadius: 12,
    },
    cardTextContainer: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
    },
    cardButtonContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        right: -10,
    },
    actionButton: {
        minWidth: 90,
        right: 10,
        height: 40,
        verticalAlign: 'middle',
        top: Platform.OS === 'android' ? 14 : 0,
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
        maxHeight: 100,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});

export default TestListScreen;
