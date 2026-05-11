/**
 * @fileoverview Pantalla de login con fondo degradado y diseño glassmorphism
 * @module features/auth/LoginScreen
 */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import GradientBackground from './components/GradientBackground';
import LoginCard from './components/LoginCard';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
    const router = useRouter();

    const handleForgotPassword = () => {
        router.push('/features/auth/ForgotPasswordScreen');
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <LoginCard onForgotPassword={handleForgotPassword} />
            </SafeAreaView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoginScreen;