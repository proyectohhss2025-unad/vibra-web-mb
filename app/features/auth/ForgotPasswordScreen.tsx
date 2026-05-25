/**
 * @fileoverview Pantalla de recuperación de contraseña
 * @module features/auth/ForgotPasswordScreen
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTailwind } from 'tailwind-rn';
import GradientBackground from './components/GradientBackground';
import { showTamaguiAlert } from '@/shared/components/ui/tamagui';
import TamaguiGlassCard from '@/shared/components/ui/tamagui/TamaguiGlassCard';
import TamaguiButton from '@/shared/components/ui/tamagui/TamaguiButton';
import AuthService, { EmailFormData } from '@/shared/services/api/auth';

type Step = 'request' | 'success';

const ForgotPasswordScreen: React.FC = () => {
    const tailwind = useTailwind();
    const router = useRouter();
    const [step, setStep] = useState<Step>('request');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (emailValue: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailValue);
    };

    const handleSendEmail = async () => {
        if (!email.trim()) {
            setError('Ingresa tu email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Formato de email no válido');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const formData: EmailFormData = {
                to: email,
                subject: 'Recuperación de contraseña - Vibra',
                message: 'Has solicitado recuperar tu contraseña. Si no fuiste tú, ignora este mensaje.',
            };

            await AuthService.recoverPassword(formData);
            setStep('success');
        } catch (err: any) {
            if (err.message?.includes('404') || err.message?.includes('not found')) {
                setError('No encontramos esa dirección de email. Verifica o regístrate.');
            } else {
                showTamaguiAlert('Error', 'No pudimos enviar el email. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleGoToLogin = () => {
        router.replace('/');
    };

    // Step 1: Request email
    if (step === 'request') {
        return (
            <GradientBackground>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.content}>
                        {/* Back button */}
                        <TamaguiButton
                            title="Volver"
                            variantColor="gray"
                            onPress={handleBack}
                            icon="arrow-back"
                            iconSize={20}
                            buttonType="standard"
                            style={styles.backButton}
                        />

                        {/* Card */}
                        <TamaguiGlassCard style={styles.card}>
                            {/* Lock icon */}
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>🔒</Text>
                            </View>

                            {/* Title */}
                            <Text style={[styles.title, tailwind('text-white text-center mb-2')]}>
                                ¿Olvidaste tu contraseña?
                            </Text>

                            {/* Description */}
                            <Text style={[styles.description, tailwind('text-gray-50 text-center mb-6')]}>
                                Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.
                            </Text>

                            {/* Input */}
                            <TextInput
                                style={[
                                    styles.input,
                                    tailwind('w-full p-4 border rounded-xl mb-2 bg-white/10 text-white'),
                                    error ? styles.inputError : null
                                ]}
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setError('');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {/* Error message */}
                            {error ? (
                                <Text style={[styles.errorText, tailwind('text-red-400 text-sm mb-3')]}>
                                    {error}
                                </Text>
                            ) : null}

                            {/* Send button */}
                            <TamaguiButton
                                title={loading ? 'Enviando...' : 'Enviar enlace'}
                                variantColor="blue"
                                onPress={handleSendEmail}
                                icon="send"
                                disabled={loading}
                                buttonType="iconTop"
                                iconSize={24}
                                fullWidth={true}
                                style={styles.button}
                            />
                        </TamaguiGlassCard>
                    </View>
                </KeyboardAvoidingView>
            </GradientBackground>
        );
    }

    // Step 2: Success confirmation
    return (
        <GradientBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Back button */}
                    <TamaguiButton
                        title="Volver"
                        variantColor="gray"
                        onPress={handleBack}
                        icon="arrow-back"
                        iconSize={20}
                        buttonType="standard"
                        style={styles.backButton}
                    />

                    {/* Card */}
                    <TamaguiGlassCard style={styles.card}>
                        {/* Check icon */}
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconSuccess}>✓</Text>
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, tailwind('text-white text-center mb-2')]}>
                            Revisa tu email
                        </Text>

                        {/* Description */}
                        <Text style={[styles.description, tailwind('text-white/70 text-center mb-4')]}>
                            Enviamos un enlace de recuperación a:
                        </Text>

                        {/* Email shown */}
                        <Text style={[styles.emailShown, tailwind('text-cyan-400 text-center mb-6 font-bold')]}>
                            {email}
                        </Text>

                        <Text style={[styles.description, tailwind('text-white/70 text-center mb-6')]}>
                            Haz clic en el enlace para crear una nueva contraseña.
                        </Text>

                        {/* Go to login button */}
                        <TamaguiButton
                            title="Volver al login"
                            variantColor="gray"
                            onPress={handleGoToLogin}
                            buttonType="standard"
                            fullWidth={true}
                            style={styles.buttonOutline}
                        />
                    </TamaguiGlassCard>
                </View>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        zIndex: 10,
    },
    card: {
        width: '85%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    icon: {
        fontSize: 48,
    },
    iconSuccess: {
        fontSize: 48,
        color: '#00D9FF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    emailShown: {
        fontSize: 16,
    },
    input: {
        height: 52,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        textAlign: 'left',
        width: '100%',
    },
    button: {
        height: 52,
        marginTop: 8,
    },
    buttonOutline: {
        height: 52,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
});

export default ForgotPasswordScreen;