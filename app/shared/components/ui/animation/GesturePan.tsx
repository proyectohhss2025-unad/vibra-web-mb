import React from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

export default function GesturePan() {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd(() => {
            translateX.value = withSpring(0, { damping: 10, stiffness: 100 });
            translateY.value = withSpring(0, { damping: 10, stiffness: 100 });
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.card, animatedStyle]} />
        </GestureDetector>
    );
}

const styles = {
    card: {
        width: 150,
        height: 150,
        backgroundColor: "purple",
        borderRadius: 20,
        //alignSelf: "center",
        marginTop: 200,
    },
};
