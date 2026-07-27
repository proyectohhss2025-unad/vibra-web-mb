import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
    size?: number;
};

const UserIllustration: React.FC<Props> = ({ size = 64 }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0066FF', '#00CCFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconContainer, { width: size, height: size, borderRadius: size / 2 }]}
            >
                <MaterialCommunityIcons
                    name="account-plus"
                    size={size * 0.6}
                    color="white"
                />
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
});

export default UserIllustration;