import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface OfflineBannerProps {
  visible: boolean;
}

const OfflineBanner = ({ visible }: OfflineBannerProps) => {
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
    >
      <MaterialIcons name="wifi-off" size={16} color="white" />
      <Text style={styles.text}>
        Sin conexión — los datos pueden no estar actualizados
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    height: 40,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
