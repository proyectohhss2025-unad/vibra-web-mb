/**
 * @fileoverview Fondo con degradado oscuro para pantallas de autenticación
 * @module features/auth/components/GradientBackground
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientBackgroundProps = {
    children: React.ReactNode;
    style?: object;
};

/**
 * Colores del degradado según spec SW-001
 * De violeta oscuro a azul oscuro — estilo moderno tipo apps de streaming
 */
const COLORS = {
    start: '#1a0a2e',    // Violeta oscuro
    end: '#0d1b2a',       // Azul oscuro
};

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={[COLORS.start, COLORS.end]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradient}
            >
                {children}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default GradientBackground;