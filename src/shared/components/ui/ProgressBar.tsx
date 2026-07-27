import useAuth from '@shared/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

export default function ProgressBarVibra() {
    const tailwind = useTailwind();
    const { logout } = useAuth();
    const [animate, setAnimate] = useState(false);
    const chargeAnimation = useRef(new Animated.Value(0)).current;
    const chargeLevel = 70; // Your actual charge level

    useEffect(() => {
        const createChargeAnimation = () => {
            Animated.sequence([
                Animated.timing(chargeAnimation, {
                    toValue: 5,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(chargeAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                })
            ]).start(() => {
                createChargeAnimation();
            });
        };

        createChargeAnimation();

        return () => {
            chargeAnimation.stopAnimation();
        };
    }, []);

    const animatedWidth = chargeAnimation.interpolate({
        inputRange: [0, 5],
        outputRange: [`${chargeLevel}%`, `${Math.min(chargeLevel + 25, 100)}%`]
    });

    return (
        <ScrollView style={[styles.scrollView, tailwind('bg-gray-50')]}>
            <View style={styles.progressBarContainer}>
                <View style={styles.batteryContainer}>
                    <View style={styles.batteryWrapper}>
                        <View style={styles.batteryBody}>
                            <Animated.View
                                style={[
                                    styles.batteryCharge,
                                    {
                                        width: animatedWidth,
                                        backgroundColor: getChargeColor(chargeLevel)
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.batteryHead} />
                    </View>
                    <Text style={styles.progressText}> Nivel de Vibra: {chargeLevel}%</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const getChargeColor = (level: number) => {
    if (level <= 20) return '#FF4444';
    if (level <= 50) return '#FFBB33';
    return '#4CAF50';
};

const styles = StyleSheet.create({
    progressBarContainer: {
        width: '100%',
        borderRadius: 10,
        marginVertical: 2,
    },
    progressBar: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#007bff',
    },
    batteryContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    batteryWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    batteryBody: {
        width: 150,
        height: 50,
        borderWidth: 3,
        borderColor: '#333',
        borderRadius: 10,
        padding: 2,
        backgroundColor: '#fff',
    },
    batteryHead: {
        width: 10,
        height: 20,
        backgroundColor: '#333',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginLeft: -3,
    },
    batteryCharge: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 6,
    },
    progressText: {
        textAlign: 'center',
        marginTop: 4,
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
    },
    scrollView: {
        padding: 4,
        borderColor: 'transparent',
    },
    input: {
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        top: 0,
        paddingHorizontal: 8,
        width: 120,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        marginTop: 20,
        width: 10,
        height: 10,
        backgroundColor: '#FFFFFF',
    },
});