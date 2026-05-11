/**
 * @fileoverview Card con efecto glassmorphism sutil para pantallas de autenticación
 * @module shared/components/ui/GlassCard
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTailwind } from 'tailwind-rn';

type GlassCardProps = {
    children: React.ReactNode;
    style?: ViewStyle;
};

/**
 * GlassCard — Card con glassmorphism sutil
 *
 * Diseño según spec SW-001:
 * - Fondo semi-transparente rgba(255,255,255,0.08)
 * - Borde sutil rgba(255,255,255,0.15)
 * - Border radius 16px
 * - Padding interno 24px
 */
const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
    const tailwind = useTailwind();

    return (
        <View
            style={[
                styles.container,
                tailwind('rounded-2xl p-6'),
                style
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
    },
});

export default GlassCard;