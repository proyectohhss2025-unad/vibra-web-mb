import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useTailwind } from 'tailwind-rn';
import socket from '../../../socket';
import api from '../../shared/services/api/api';

const UserRankingList = () => {
    const tailwind = useTailwind();
    const [selectedUser, setSelectedUser] = useState<any>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [items, setItems] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [rank, setRank] = useState(550);

    useEffect(() => {
        socket.on('customEvent', (data) => {
            setMessage(data.message);
            Alert.alert('Evento Recibido', data.message);
        });

        socket.emit('clientEvent', 'Hola desde el cliente');

        return () => {
            socket.off('customEvent');
        };
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const roleResponse: any = await api.get(`/users/all`, {
                    /*headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') ?? 'asdf'}`
                    }*/
                });
                console.log('roleResponse?.data:', roleResponse?.data);
                setItems([...roleResponse.data,
                {
                    username: 'Juan Perez',
                    documentNumber: '123456789',
                    typeDocument: 'DNI',
                    email: 'juan.perez@example.com',
                    keepSessionActive: true,
                    role: {
                        name: 'Estudiante'
                    },
                    avatar: '../../assets/avatars/06.jpg', // URL de la imagen del avatar
                    course: {
                        name: 'Matemáticas',
                        hightSchool: {
                            name: 'Institucion I'
                        }
                    }
                },
                {
                    username: 'Yovany Suarez Silva',
                    documentNumber: '987654321',
                    typeDocument: 'Tarjeta de identidad',
                    email: 'maria.gomez@example.com',
                    keepSessionActive: false,
                    role: {
                        name: 'Estudiante'
                    },
                    avatar: '../../assets/avatars/03.jpg',
                    course: {
                        name: 'Primero B',
                        hightSchool: {
                            name: 'Institucion I'
                        }
                    }
                }]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [message]);

    const handleUserPress = (user: any): void => {
        console.log('user: ', user.username);
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>Error: {error}</Text>
            </View>
        );
    }

    return (<>
        <View style={tailwind('flex-1 h-full p-2 bg-gray-100')}>
            <ScrollView>
                {items.map((user: any, index: number) => (
                    <TouchableOpacity
                        key={index + 1}
                        onPress={() => handleUserPress(user)}
                        style={tailwind('bg-white p-2 mb-2 px-4 rounded-lg shadow-sm flex-row items-center')}
                    >
                        <View style={tailwind('flex-1')}>
                            <Text style={tailwind('text-lg font-bold text-gray-800')}>
                                {user.username}
                            </Text>
                            <Text style={tailwind('text-sm text-gray-600')}>
                                {user.course.name} -  {user.course?.hightSchool?.name}
                            </Text>
                        </View>
                        <Image
                            source={require('../../assets/avatars/03.jpg')}
                            style={tailwind('w-10 h-10 rounded-full')}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/*<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <Text>Mensaje del servidor: {message}</Text>
                <Button
                    title="Emitir Evento"
                    onPress={() => socket.emit('clientEvent', 'Nuevo mensaje desde el cliente')}
                />
            </View>*/}
        </View>
        <Modal isVisible={isModalVisible} onBackdropPress={closeModal}
            useNativeDriver={true}
            animationIn="slideInUp"
            animationOut="slideOutDown">
            <View style={[{ height: 440 }, tailwind('bg-white p-2 rounded-lg w-full')]}>
                {(
                    <>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                            <Text style={tailwind('text-xl font-bold mb-4 text-gray-800 mt-6')}>
                                Información del Usuario {selectedUser?.username}
                            </Text>
                            <Image
                                source={require('../../assets/avatars/03.jpg')}
                                style={tailwind('w-10 h-10 rounded-full')}
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                            <Text style={tailwind('text-sm text-gray-800 mt-4')}>
                                Nombre:
                            </Text>
                            <Text style={tailwind('text-sm font-bold text-gray-800')}>
                                {selectedUser.username}
                            </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                            <Text >Rank: {rank}</Text>
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                {[...Array(5)].map((_, index) => (
                                    <FontAwesome5
                                        key={index + 1}
                                        name="star"
                                        solid
                                        style={{ color: index < 3 ? "#ffd700" : "#929292", marginLeft: 5 }}
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={tailwind('text-sm text-gray-600')}>
                                Documento:
                            </Text>
                            <Text style={tailwind('text-sm font-bold text-gray-600')}>
                                {selectedUser.typeDocument} {selectedUser.documentNumber}
                            </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={tailwind('text-sm text-gray-600')}>
                                Email:
                            </Text>
                            <Text style={tailwind('text-sm font-bold text-gray-600')}>
                                {selectedUser.email}
                            </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={tailwind('text-sm text-gray-600')}>
                                Rol:
                            </Text>
                            <Text style={tailwind('text-sm font-bold text-gray-600')}>
                                {selectedUser.role?.name}
                            </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={tailwind('text-sm font-bold text-gray-600')}>
                                Sesión Activa: {selectedUser.keepSessionActive ? 'Sí' : 'No'}
                            </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={tailwind('text-sm text-gray-600')}>
                                Curso:
                            </Text>
                            <Text style={tailwind('text-sm font-bold text-gray-600')}>
                                {selectedUser.course?.name} - {selectedUser.course?.hightSchool?.name}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={closeModal}
                            style={tailwind('mt-4 bg-blue-500 p-3 rounded-lg items-center')}
                        >
                            <Text style={tailwind('text-white font-bold')}>Cerrar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Modal>
    </>);
};

export default UserRankingList;