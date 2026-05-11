import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { getSafeKeyObjectFromStorage } from '../../shared/utils/safe-token-storage';
import useAuth from '../../shared/hooks/useAuth';
import useUser, { UserProvider } from '@/context/UserContext';
import CustomButton from '@/shared/components/ui/CustomButton';
import AuthService, { EmailFormData } from '@/shared/services/api/auth';
const mainLogo = require('../../assets/logo-vibra.png');


const LoginForm: React.FC = () => {
    const keepSessionActive = async () => Platform.OS == "web"
        ? JSON.parse(getSafeKeyObjectFromStorage('keepSessionActive'))
        : await AsyncStorage.getItem("keepSessionActive");

    const tailwind = useTailwind();
    const [password, setPassword] = useState('Pb*H7^YEQ!va');
    const [email, setEmail] = useState('yovanysuarezsilva@gmail.com');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const { setUser } = useUser();

    const [formData, setFormData] = useState<EmailFormData>({
        to: 'correo@dominio.com',
        subject: '...',
        message: 'Hi ... 🚀',
    });

    useEffect(() => {
        console.log('keepSessionActive in useEffect', keepSessionActive);
        keepSessionActive().then(result => {
            setIsEnabled(!!result);
        });
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            const policiesAccepted = Platform.OS == "web"
                ? getSafeKeyObjectFromStorage('policiesAccepted')
                : AsyncStorage.getItem("policiesAccepted");
            if (policiesAccepted === 'true') {
                router.push('/features/test/TestListScreen');
            } else {
                router.push('/features/policy/PolicyScreen');
            }
        }
    }, [isAuthenticated])

    const toggleSwitch = async () => {
        setIsEnabled(previousState => !previousState);
        if (Platform.OS == "web") {
            localStorage.setItem("keepSessionActive", `${!isEnabled}`);
        }
        if (Platform.OS == "android" || Platform.OS == "ios") {
            await AsyncStorage.setItem(`keepSessionActive`, `${!isEnabled}`);
            console.log('keepSessionActive:', await AsyncStorage.getItem("keepSessionActive"));
        }
    };

    const handlePasswordRecovery = async () => {
        try {
            const response = await AuthService.recoverPassword(formData);

            if (response) {
                setModalVisible(false);
                Alert.alert(response.message || response.error);
            }
        } catch (error) {
            Alert.alert('Error de conexión');
        }
    };

    const handleNext = async () => {
        /*if (!isAuthenticated) {
            console.log('Por favor, inicie una sesión');
            //Alert.alert('Error', 'Por favor, inicie una sesión');
            return;
        }*/
        //router.push('/features/(tabs)/one')

    };

    const handleLogin = async () => {
        setLoading(true);

        try {
            const user = await login(email, password);
            setUser(user);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Credenciales incorrectas o error en la conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        router.push('/features/users/RegisterForm'); // Navegación usando el router
    }

    return (
        <View style={styles.container}>
            <StatusBar style="inverted" />
            <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
                <Image
                    source={mainLogo}
                    style={{ width: 150, height: 150, alignItems: 'center', marginTop: 20 }}
                />
            </View>
            {!isEnabled && <>
                <Text style={tailwind('text-3xl font-bold text-center mb-2 text-white mt-4')}>
                    Iniciar Sesión
                </Text>
                <TextInput
                    style={[styles.input, tailwind('w-full p-3 border border-gray-300 rounded-md mb-4 my-2 bg-white')]}
                    placeholder="Usuario"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={[styles.input, tailwind('w-full p-3 border border-gray-300 rounded-md mb-4 my-2 bg-white')]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </>}
            {<View style={styles.switchContainer}>
                <Text style={[styles.switchTitle, tailwind('mr-2 text-white')]}>Mantener sesión iniciada</Text>
                <Switch
                    style={tailwind('mt-2')}
                    trackColor={{ false: 'blue', true: 'red' }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    value={isEnabled}
                    onValueChange={toggleSwitch}
                />
            </View>}
            {!isEnabled && <View style={tailwind('flex-row h-24 justify-center w-full mb-3 my-2')}>
                <CustomButton
                    neonEffect={true}
                    title={loading ? 'Cargando...' : 'Conectarse'}
                    variantColor='blue'
                    onPress={() => {
                        handleLogin();
                    }}
                    icon='login'
                    disabled={loading}
                    buttonType='iconTop'
                    iconSize={32}
                    fullWidth={false}
                    style={[{ flex: 1 }, tailwind('w-full text-xl text-white')]}
                />

                <CustomButton
                    neonEffect={true}
                    title={loading ? 'Cargando...' : 'Registrarse'}
                    variantColor='orange'
                    onPress={() => {
                        handleRegister();
                    }}
                    icon='person-add'
                    disabled={loading}
                    buttonType='iconTop'
                    iconSize={32}
                    fullWidth={false}
                    style={[{ flex: 1 }, tailwind('w-full text-xl text-white')]}
                />

                <CustomButton
                    neonEffect={true}
                    title={loading ? 'Cargando...' : 'Acerca de ...'}
                    variantColor='purple'
                    onPress={() => {
                        router.push('/features/about/AboutScreen');
                    }}
                    icon='tag'
                    disabled={loading}
                    buttonType='iconTop'
                    iconSize={32}
                    fullWidth={true}
                    style={[{ flex: 1 }, tailwind('w-full text-xl text-white')]}
                />
            </View>}

            {isEnabled && <TouchableOpacity
                style={tailwind('w-full bg-blue-500 p-3 rounded-md items-center mb-4 mt-4')}
                onPress={handleNext}
                disabled={loading}
            >
                <Text style={tailwind('text-white text-lg font-bold text-center')}>
                    <MaterialCommunityIcons name="script-text-key" style={{ marginInline: 20 }} size={24} color="white" />
                    {loading ? 'Cargando...' : 'Continuar'}
                </Text>
            </TouchableOpacity>}

            <Text style={[styles.link, tailwind('mt-6 mb-4')]} onPress={() => setModalVisible(true)}>
                ¿Olvidaste tu contraseña?
            </Text>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
                        <TextInput
                            style={[styles.input, tailwind('w-full p-3 border border-gray-300 rounded-md mb-4 my-2')]}
                            placeholder="Correo electrónico"
                            value={formData.to}
                            onChangeText={(text) => setFormData({ ...formData, to: text })}
                        />
                        <View style={tailwind('flex-row justify-between items-center mt-4 w-full')}>

                            <CustomButton
                                neonEffect={true}
                                icon="cancel"
                                variantColor='gray'
                                title={loading ? 'Cargando...' : 'Cancelar'}
                                disabled={loading}
                                style={[{}, tailwind("text-xl text-white")]}
                                onPress={() => setModalVisible(false)}
                            />

                            <CustomButton
                                neonEffect={true}
                                icon="link"
                                variantColor='red'
                                title={loading ? 'Cargando...' : 'Recuperar'}
                                disabled={loading}
                                style={[{}, tailwind("text-xl text-white")]}
                                onPress={handlePasswordRecovery}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 10,
        width: "80%"
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 44,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        padding: 10,
        fontSize: 20,
    },
    link: {
        color: 'white',
        textAlign: 'center',
        marginTop: 12,
        fontSize: 18,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    switchTitle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 360,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 16,
    },
});

export default LoginForm;