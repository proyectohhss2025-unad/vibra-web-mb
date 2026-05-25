import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface EmotionalAssistantProps {
  visible: boolean;
  emoji: string;
  message: string;
  position?: 'floating' | 'banner';
  onDismiss?: () => void;
  autoHideMs?: number;
}

const EmotionalAssistant: React.FC<EmotionalAssistantProps> = ({
  visible,
  emoji,
  message,
  position = 'floating',
  onDismiss,
  autoHideMs,
}) => {
  const tailwind = useTailwind();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Animación de entrada/salida
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      if (autoHideMs && autoHideMs > 0) {
        hideTimer.current = setTimeout(() => {
          hide();
        }, autoHideMs);
      }
    } else {
      hide();
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, emoji]);

  // Animación de flotación infinita (solo para floating)
  useEffect(() => {
    if (position === 'floating' && visible) {
      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      float.start();
      return () => float.stop();
    }
  }, [position, visible]);

  const hide = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  }, [fadeAnim, onDismiss]);

  if (!visible) return null;

  // ─── Variante Banner ──────────────────────────────────────────────
  if (position === 'banner') {
    return (
      <Animated.View
        style={[
          tailwind('flex-row items-center bg-indigo-50 border-l-4 border-indigo-300 rounded-md px-4 py-3 mx-4 mb-2'),
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={tailwind('text-2xl mr-3')}>{emoji}</Text>
        <Text style={tailwind('flex-1 text-indigo-800 text-sm font-medium')}>
          {message}
        </Text>
        <TouchableWithoutFeedback onPress={hide}>
          <Text style={tailwind('text-indigo-400 text-lg ml-2')}>✕</Text>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  // ─── Variante Floating ────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        tailwind('absolute bottom-4 right-4 items-end'),
        { opacity: fadeAnim },
      ]}
    >
      {/* Burbuja de texto */}
      <Animated.View
        style={[
          tailwind('bg-white rounded-xl px-4 py-2.5 mb-2 shadow-md'),
          styles.bubble,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={tailwind('text-gray-700 text-sm')}>{message}</Text>
      </Animated.View>

      {/* Emoji flotante animado */}
      <TouchableWithoutFeedback onPress={hide}>
        <Animated.View
          style={[
            tailwind('bg-white rounded-full w-14 h-14 items-center justify-center shadow-lg'),
            { transform: [{ translateY: floatAnim }] },
          ]}
        >
          <Text style={tailwind('text-3xl')}>{emoji}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    zIndex: 100,
    maxWidth: '80%',
  },
  bubble: {
    maxWidth: 220,
    borderTopRightRadius: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default EmotionalAssistant;
