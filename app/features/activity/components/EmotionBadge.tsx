import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmotionBadgeProps {
    emotion: string;
    size?: 'small' | 'medium';
}

const emotionConfig: { [key: string]: { color: string; icon: string } } = {
    alegría: { color: '#FBBF24', icon: 'happy' },
    tristeza: { color: '#60A5FA', icon: 'sad' },
    enojo: { color: '#F87171', icon: 'flame' },
    tranquilidad: { color: '#34D399', icon: 'leaf' },
    ansiedad: { color: '#A78BFA', icon: 'alert' },
    excitación: { color: '#FB7185', icon: 'flash' },
    agradecimiento: { color: '#FBBF24', icon: 'heart' },
    // add more emotions as needed
};

const EmotionBadge: React.FC<EmotionBadgeProps> = ({ emotion, size = 'medium' }) => {
    const config = emotionConfig[emotion.toLowerCase()] || {
        color: '#6B7280',
        icon: 'help',
    };

    const sizes = {
        small: { icon: 16, padding: 6, fontSize: 12 },
        medium: { icon: 24, padding: 8, fontSize: 14 },
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: config.color + '20',
                    padding: sizes[size].padding,
                    borderRadius: 20,
                },
            ]}
        >
            <Ionicons
                name={config.icon as any}
                size={sizes[size].icon}
                color={config.color}
                style={styles.icon}
            />
            <Text
                style={[
                    styles.text,
                    {
                        color: config.color,
                        fontSize: sizes[size].fontSize,
                    },
                ]}
            >
                {emotion}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});

export default EmotionBadge;