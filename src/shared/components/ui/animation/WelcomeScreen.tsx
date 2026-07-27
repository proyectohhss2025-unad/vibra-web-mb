import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const textTranslateY = useSharedValue(50);
  const buttonTranslateY = useSharedValue(100);
  const backgroundScale = useSharedValue(1.2);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });

    textTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) });
    buttonTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });

    backgroundScale.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.exp) });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image source={{ uri: "https://source.unsplash.com/featured/?nature" }} style={[styles.background, backgroundStyle]} />

      <Animated.Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" }} style={[styles.logo, logoStyle]} />

      <Animated.Text style={[styles.text, textStyle]}>¡Bienvenido a nuestra App!</Animated.Text>

      <Animated.View style={[buttonStyle]}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>Empezar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    width: width * 1.2,
    height: height * 1.2,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    color: "#333",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
};

