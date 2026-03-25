import React from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import useAuth from "@/shared/hooks/useAuth";

export default function FloatButton() {
    const scale = useSharedValue(1);
    const { logout } = useAuth();
    const tap = Gesture.Tap()
        .onBegin(() => {
            scale.value = withSpring(0.8, { damping: 10, stiffness: 200 });
        })
        .onEnd(() => {
            scale.value = withSpring(1);
            logout();
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <GestureDetector gesture={tap}>
                <Animated.View style={[styles.button as {}, animatedStyle]}>
                    <Text style={{ color: 'white' }}>Desconectar</Text>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = {
    button: {
        width: 100,
        height: 100,
        backgroundColor: "red",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center"
    },
};