import React from "react";
import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

export default function GestureElasticMenu() {
    const translateX = useSharedValue(-250);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = Math.min(0, event.translationX - 250);
        })
        .onEnd(() => {
            if (translateX.value > -150) {
                translateX.value = withSpring(0);
            } else {
                translateX.value = withSpring(-250);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={{ flex: 1, backgroundColor: "#ddd" }}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.menu, animatedStyle]}>
                    <Text style={styles.menuText}>Menú</Text>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = {
    menu: {
        left: 0,
        top: 0,
        bottom: 0,
        width: 250,
        backgroundColor: "black",
        padding: 20,
    },
    menuText: {
        color: "white",
        fontSize: 20,
    },
};
