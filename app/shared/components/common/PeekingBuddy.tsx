import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { getTipFromActivity, EmotionalTip } from '../../constants/emotional-tips';
import { Tip } from '../../constants/emotional-tips';

interface PeekingBuddyProps {
  tips: Tip[] | undefined;
  currentCategory: string;
  onTipShown?: () => void;
}

type BuddyState = 'idle' | 'listening' | 'celebrating' | 'thinking' | 'sleepy';

const STATE_EMOJIS: Record<BuddyState, string> = {
  idle: '😊',
  listening: '👀',
  celebrating: '🎉',
  thinking: '🤔',
  sleepy: '😴',
};

const PeekingBuddy: React.FC<PeekingBuddyProps> = ({
  tips,
  currentCategory,
  onTipShown,
}) => {
  const tailwind = useTailwind();
  const [buddyState, setBuddyState] = useState<BuddyState>('idle');
  const [currentTip, setCurrentTip] = useState<EmotionalTip | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  // Valores animados
  const floatAnim = useRef(new Animated.Value(0)).current;
  const peekAnim = useRef(new Animated.Value(0)).current;
  const lookAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pointAnim = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lastInteraction = useRef(Date.now());
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lookTimer = useRef<NodeJS.Timeout | null>(null);
  const blinkTimer = useRef<NodeJS.Timeout | null>(null);

  // ─── Animación de flotación (idle) ───────────────────────────────────
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -4, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    float.start();
    return () => float.stop();
  }, []);

  // ─── Animación de asomarse (al montar) ───────────────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(peekAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(peekAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    // Asomarse periódicamente
    const peekInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(peekAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(peekAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 30000);

    return () => clearInterval(peekInterval);
  }, []);

  // ─── Mirar alrededor (cada 15s) ─────────────────────────────────────
  useEffect(() => {
    const doLookAround = () => {
      Animated.sequence([
        Animated.timing(lookAnim, { toValue: -1, duration: 400, useNativeDriver: true }),
        Animated.delay(300),
        Animated.timing(lookAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(300),
        Animated.timing(lookAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    };

    lookTimer.current = setInterval(doLookAround, 15000);
    return () => { if (lookTimer.current) clearInterval(lookTimer.current); };
  }, []);

  // ─── Parpadear (aleatorio cada 5-10s) ───────────────────────────────
  useEffect(() => {
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    };

    const scheduleBlink = () => {
      const delay = 5000 + Math.random() * 5000;
      blinkTimer.current = setTimeout(() => {
        doBlink();
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();

    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, []);

  // ─── Señalar cuando hay tip disponible ──────────────────────────────
  useEffect(() => {
    if (showBubble) {
      const point = Animated.loop(
        Animated.sequence([
          Animated.timing(pointAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
          Animated.timing(pointAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      );
      point.start();
      return () => point.stop();
    }
  }, [showBubble]);

  // ─── Inactividad → cambiar estado ──────────────────────────────────
  useEffect(() => {
    const checkInactivity = () => {
      const elapsed = Date.now() - lastInteraction.current;
      if (elapsed > 60000) setBuddyState('sleepy');
      else if (elapsed > 15000) setBuddyState('thinking');
      else setBuddyState('idle');
    };

    inactivityTimer.current = setInterval(checkInactivity, 5000);
    return () => { if (inactivityTimer.current) clearInterval(inactivityTimer.current); };
  }, []);

  // ─── Mostrar tip ────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    lastInteraction.current = Date.now();
    setBuddyState('listening');

    // Pop animation
    Animated.sequence([
      Animated.spring(popAnim, { toValue: 1.3, friction: 3, useNativeDriver: true }),
      Animated.spring(popAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Mostrar tip
    const tip = getTipFromActivity(tips, currentCategory);
    setCurrentTip(tip);
    setShowBubble(true);
    onTipShown?.();

    Animated.spring(bubbleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

    // Ocultar burbuja después de 6s
    setTimeout(() => {
      Animated.timing(bubbleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setShowBubble(false);
        setBuddyState('idle');
      });
    }, 6000);
  }, [tips, currentCategory, onTipShown]);

  const dismissBubble = useCallback(() => {
    Animated.timing(bubbleAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowBubble(false);
      setBuddyState('idle');
    });
  }, []);

  const emoji = STATE_EMOJIS[buddyState];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Burbuja de tip */}
      {showBubble && currentTip && (
        <Animated.View
          style={[
            tailwind('bg-white rounded-xl px-4 py-2.5 mb-1 shadow-md'),
            styles.bubble,
            {
              opacity: bubbleAnim,
              transform: [{ scale: bubbleAnim }],
            },
          ]}
        >
          <View style={tailwind('flex-row items-center')}>
            <Text style={tailwind('text-gray-700 text-sm flex-1')}>
              {currentTip.emoji} {currentTip.message}
            </Text>
            <TouchableWithoutFeedback onPress={dismissBubble}>
              <Text style={tailwind('text-gray-400 text-base ml-2')}>✕</Text>
            </TouchableWithoutFeedback>
          </View>
        </Animated.View>
      )}

      {/* Personaje animado */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View
          style={[
            tailwind('bg-white rounded-full w-14 h-14 items-center justify-center shadow-lg'),
            {
              opacity: fadeAnim,
              transform: [
                { translateY: floatAnim },
                { translateX: Animated.multiply(lookAnim, new Animated.Value(3)) },
                { scale: popAnim },
              ],
            },
          ]}
        >
          {/* Parpadeo (cambia la escala Y momentáneamente) */}
          <Animated.View style={{ transform: [{ scaleY: blinkAnim }] }}>
            <Text style={tailwind('text-3xl')}>{emoji}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Brazo señalando (cuando hay burbuja) */}
      {showBubble && (
        <Animated.View
          style={[
            styles.pointingArm,
            { transform: [{ translateY: pointAnim }] },
          ]}
        >
          <Text style={tailwind('text-lg')}>👆</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    zIndex: 100,
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: 240,
    borderBottomLeftRadius: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointingArm: {
    position: 'absolute',
    top: -18,
    left: 32,
  },
});

export default PeekingBuddy;
