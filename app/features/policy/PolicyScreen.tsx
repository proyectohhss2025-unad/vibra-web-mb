import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { useRouter } from 'expo-router';
import { getSafeKeyObjectFromStorage } from '../../shared/utils/safe-token-storage';
import api from '../../shared/services/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PolicyScreen = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const [policiesAccepted, setPoliciesAccepted] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await api.get('/policies');
                console.log('Policies:', response.data);
                setPolicies(response.data);
            } catch (err) {
                setError('Error cargando las políticas de uso');
                Alert.alert('Error', 'Unable to load policies. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    useEffect(() => {
        const checkPolicyAcceptance = async () => {
            const accepted = Platform.OS === 'web'
                ? getSafeKeyObjectFromStorage('policiesAccepted')
                : await AsyncStorage.getItem(`policiesAccepted`);
            if (accepted === 'true') {
                router.push('/features/test/TestListScreen');
            }
        };
        checkPolicyAcceptance();
    }, []);

    const handleAcceptPolicies = async () => {
        if (Platform.OS === 'web') {
            localStorage.setItem('policiesAccepted', 'true');
        }
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            await AsyncStorage.setItem('policiesAccepted', 'true');
        }
        setPoliciesAccepted(true);
        try {
            const resSendApprovedPolicies = await api.post('/policies/accept-multiple', {
                userId: '67c21ed4f905699888106f03',
                policyIds: policies.map((policy: any) => policy._id),
            });

            console.log('resSendApprovedPolicies:', resSendApprovedPolicies);
            router.push('/features/test/TestListScreen');
        } catch (error: any) {
            Alert.alert('Error', 'Error al aceptar las políticas.');
        }
    };

    const handleDeclinePolicies = () => {
        Alert.alert(
            'Políticas Requeridas',
            'Debe aceptar las políticas para continuar usando la aplicación.',
            [{ text: 'Entendido', style: 'cancel' }]
        );
    };

    const handlePolicyPress = (policy: any) => {
        setSelectedPolicy(policy);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={[styles.container, tailwind('bg-gray-100')]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, tailwind('bg-gray-100')]}>
                <Text style={tailwind('text-red-500 text-center')}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, tailwind('bg-gray-100')]}>
            <Text style={tailwind('text-2xl font-bold text-center mb-6')}>Políticas de Uso</Text>
            <ScrollView style={tailwind('w-full')}>
                {policies.map((policy: any, index) => (
                    <TouchableOpacity
                        key={index + 1}
                        style={tailwind('bg-white p-4 rounded-lg mb-4 shadow')}
                        onPress={() => handlePolicyPress(policy)}
                    >
                        <Text style={tailwind('text-lg font-bold mb-2')}>{policy.title}</Text>
                        <Text numberOfLines={2} style={tailwind('text-gray-600')}>{policy.content}</Text>
                        <Text style={tailwind('text-blue-500 mt-2')}>Ver más...</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, tailwind('bg-gray-700 bg-opacity-50')]}>
                    <View style={[styles.modalContent, tailwind('bg-white rounded-lg p-6')]}>
                        <ScrollView>
                            <Text style={tailwind('text-xl font-bold mb-4')}>{selectedPolicy?.title}</Text>
                            <Text style={tailwind('text-gray-700 mb-4')}>{selectedPolicy?.content}</Text>
                            {selectedPolicy?.additionalInfo && (
                                <Text style={tailwind('text-gray-600 mb-4')}>{selectedPolicy.additionalInfo}</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={tailwind('bg-blue-500 p-3 rounded-lg mt-4')}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={tailwind('text-white text-center font-bold')}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>

            <View style={tailwind('flex-row justify-between mt-6 w-full')}>
                <TouchableOpacity
                    style={tailwind('bg-gray-500 p-3 rounded-lg flex-1 mr-2')}
                    onPress={handleDeclinePolicies}
                >
                    <Text style={tailwind('text-white text-center font-bold')}>Declinar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={tailwind('bg-blue-500 p-3 rounded-lg flex-1 ml-2')}
                    onPress={handleAcceptPolicies}
                >
                    <Text style={tailwind('text-white text-center font-bold')}>Aceptar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
    },
});

export default PolicyScreen;