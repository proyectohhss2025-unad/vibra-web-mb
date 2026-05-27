/**
 * @fileoverview Card de login con diseño glassmorphism
 * @module features/auth/components/LoginCard
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { getSafeKeyObjectFromStorage } from '@/shared/utils/safe-token-storage';
import useAuthContext from '@/context/AuthContext';
import { showTamaguiAlert } from '@/shared/components/ui/tamagui';
import TamaguiButton from '@/shared/components/ui/tamagui/TamaguiButton';
import TamaguiGlassCard from '@/shared/components/ui/tamagui/TamaguiGlassCard';

const mainLogo = require('../../../assets/logo-vibra.png');

type LoginCardProps = {
    onForgotPassword?: () => void;
};

const LoginCard: React.FC<LoginCardProps> = ({ onForgotPassword }) => {
    const tailwind = useTailwind();
    const router = useRouter();
    const { login, isAuthenticated } = useAuthContext();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);

    const keepSessionActive = async () =>
        Platform.OS === 'web'
            ? JSON.parse(getSafeKeyObjectFromStorage('keepSessionActive') || 'false')
            : await AsyncStorage.getItem('keepSessionActive');

    useEffect(() => {
        keepSessionActive().then((result) => {
            setIsEnabled(!!result);
        });
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const checkPolicies = async () => {
                const policiesAccepted = Platform.OS === 'web'
                    ? getSafeKeyObjectFromStorage('policiesAccepted')
                    : await AsyncStorage.getItem('policiesAccepted');
                if (policiesAccepted === 'true') {
                    router.push('/features/test/TestListScreen');
                } else {
                    router.push('/features/policy/PolicyScreen');
                }
            };
            checkPolicies();
        }
    }, [isAuthenticated]);

    const toggleSwitch = async () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        if (Platform.OS === 'web') {
            localStorage.setItem('keepSessionActive', String(newValue));
        } else {
            await AsyncStorage.setItem('keepSessionActive', String(newValue));
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            showTamaguiAlert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(username, password);
            console.log('Login exitoso, user:', user);
            // El redirect ocurre en el useEffect que observa isAuthenticated
        } catch (error: any) {
            console.error('Login error:', error);
            showTamaguiAlert('Error', error.message || 'Credenciales incorrectas o error en la conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        router.push('/features/users/RegisterForm');
    };

    const handleAbout = () => {
        router.push('/features/about/AboutScreen');
    };

    return (
        <TamaguiGlassCard style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image source={mainLogo} style={styles.logo} />
            </View>

            {/* Título */}
            <Text style={[styles.title, tailwind('text-white text-center mb-6')]}>
                Iniciar Sesión
            </Text>

            {/* Input Email */}
            <TextInput
                style={[styles.input, tailwind('w-full p-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white')]}
                placeholder="Usuario"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            {/* Input Password */}
            <TextInput
                style={[styles.input, tailwind('w-full p-3 border border-white/20 rounded-xl mb-4 bg-white/10 text-white')]}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {/* Switch Mantener sesión */}
            <View style={styles.switchContainer}>
                <Text style={[styles.switchTitle, tailwind('mr-2 text-white')]}>
                    Mantener sesión iniciada
                </Text>
                <Switch
                    style={tailwind('mt-1')}
                    trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#00D9FF' }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="rgba(255,255,255,0.2)"
                    value={isEnabled}
                    onValueChange={toggleSwitch}
                />
            </View>

            {/* Botón Conectarse */}
            <TamaguiButton
                neonEffect={true}
                title={loading ? 'Cargando...' : 'Conectarse'}
                variantColor="blue"
                onPress={handleLogin}
                icon="login"
                disabled={loading}
                buttonType="iconTop"
                iconSize={28}
                fullWidth={true}
                style={[styles.button, tailwind('mb-3')]}
            />

            {/* Botón Registrarse */}
            <TamaguiButton
                neonEffect={true}
                title={loading ? 'Cargando...' : 'Registrarse'}
                variantColor="orange"
                onPress={handleRegister}
                icon="person-add"
                disabled={loading}
                buttonType="iconTop"
                iconSize={28}
                fullWidth={true}
                style={[styles.button, tailwind('mb-3')]}
            />

            {/* Botón Acerca de */}
            <TamaguiButton
                neonEffect={true}
                title="Acerca de"
                variantColor="purple"
                onPress={handleAbout}
                icon="tag"
                disabled={loading}
                buttonType="iconTop"
                iconSize={28}
                fullWidth={true}
                style={[styles.button, tailwind('mb-4')]}
            />

            {/* Olvidaste tu contraseña */}
            <Text
                style={[styles.link, tailwind('text-white text-center text-base mt-2')]}
                onPress={onForgotPassword}
            >
                ¿Olvidaste tu contraseña?
            </Text>
        </TamaguiGlassCard>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '85%',
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    input: {
        height: 52,
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    switchTitle: {
        fontSize: 14,
    },
    button: {
        height: 52,
    },
    link: {
        textDecorationLine: 'underline',
    },
});

export default LoginCard;