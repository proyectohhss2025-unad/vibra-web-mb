import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { Ionicons } from '@expo/vector-icons';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';

interface NoActivityStateProps {
    variant: 'banner' | 'fullscreen';
    onGoBack?: () => void;
    onCheckAgain?: () => void;
}

const NoActivityState: React.FC<NoActivityStateProps> = ({
    variant,
    onGoBack,
    onCheckAgain
}) => {
    const tailwind = useTailwind();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ─── Variante Banner ──────────────────────────────────────────────
    if (variant === 'banner') {
        return (
            <Animated.View
                style={[
                    tailwind('flex-row items-center bg-amber-50 border-l-4 border-amber-300 rounded-md px-3 py-2.5 mb-3'),
                    { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
                ]}
            >
                <Ionicons name="calendar-outline" size={20} color="#D97706" />
                <Text style={tailwind('flex-1 text-amber-800 text-sm ml-2')}>
                    Aún no hay actividad para hoy
                </Text>
                {onCheckAgain && (
                    <TouchableOpacity onPress={onCheckAgain} style={tailwind('ml-1 p-1')}>
                        <Ionicons name="refresh-outline" size={18} color="#D97706" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    }

    // ─── Variante Fullscreen ──────────────────────────────────────────
    return (
        <View style={tailwind('flex-1 justify-center items-center bg-gray-50 p-6')}>
            <Animated.View
                style={[
                    tailwind('bg-white rounded-2xl p-8 items-center max-w-sm w-full'),
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <View style={tailwind('mb-6')}>
                    <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
                </View>

                <Text style={tailwind('text-xl font-semibold text-gray-700 text-center mb-2')}>
                    Aún no hay actividad{'\n'}programada para hoy
                </Text>

                <Text style={tailwind('text-sm text-gray-400 text-center mb-8')}>
                    Vuelve más tarde, seguro tendremos{'\n'}algo nuevo para ti
                </Text>

                {onGoBack && (
                    <TamaguiButton
                        title="Volver al inicio"
                        variantColor="blue"
                        onPress={onGoBack}
                        icon="home"
                        iconPosition="left"
                        iconSize={20}
                        fullWidth={true}
                    />
                )}

                {onCheckAgain && (
                    <TouchableOpacity
                        onPress={onCheckAgain}
                        style={tailwind('mt-4')}
                    >
                        <Text style={tailwind('text-blue-500 text-sm')}>
                            ¿Ya hay actividad? Verificar de nuevo
                        </Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
};

export default NoActivityState;
