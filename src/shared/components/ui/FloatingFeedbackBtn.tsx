import React, { useRef, useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedbackModal from '../feedback/FeedbackModal';

const FloatingFeedbackBtn: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'improvement' | 'support'>('improvement');
    const animValue = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        Animated.spring(animValue, {
            toValue,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
        setExpanded(!expanded);
    };

    const handleSelect = (type: 'improvement' | 'support') => {
        setExpanded(false);
        Animated.timing(animValue, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
        setModalType(type);
        setModalVisible(true);
    };

    const option1Opacity = animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });
    const option1TranslateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });
    const option2Opacity = animValue.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [0, 0, 1],
    });
    const option2TranslateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
    });
    const rotateIcon = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            <View style={[styles.container, { bottom: insets.bottom + 90, right: 24, pointerEvents: 'box-none' as any }]}>
                {/* Opciones expandidas */}
                <Animated.View style={[styles.optionRow, { opacity: option2Opacity, transform: [{ translateY: option2TranslateY }] }]}>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelect('support')} activeOpacity={0.8}>
                        <Text style={styles.optionIcon}>💬</Text>
                        <Text style={styles.optionText}>Apoyo</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.optionRow, { opacity: option1Opacity, transform: [{ translateY: option1TranslateY }] }]}>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelect('improvement')} activeOpacity={0.8}>
                        <Text style={styles.optionIcon}>✨</Text>
                        <Text style={styles.optionText}>Mejora</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Botón principal FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={toggleExpand}
                    activeOpacity={0.85}
                >
                    <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotateIcon }] }]}>
                        📝
                    </Animated.Text>
                </TouchableOpacity>
            </View>

            {/* Modal de feedback */}
            <FeedbackModal
                visible={modalVisible}
                initialType={modalType}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 999,
    },
    optionRow: {
        marginBottom: 8,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        gap: 6,
    },
    optionIcon: { fontSize: 16 },
    optionText: { fontSize: 14, fontWeight: '500', color: '#374151' },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '300',
        lineHeight: 30,
    },
});

export default FloatingFeedbackBtn;
