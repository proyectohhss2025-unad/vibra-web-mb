import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { MaterialIcons } from '@expo/vector-icons';
import { SliderCard, getSliderData } from '@/shared/services/sliderService';
import { useRouter } from 'expo-router';

interface CardSliderProps {
    autoPlay?: boolean;
    autoPlayInterval?: number;
    withImage?: boolean;
    withContainerAutoplay?: boolean;
    withContainerIndicators?: boolean;
    withContainerAutoplayToggle?: boolean;
    withContainerButton?: boolean;
}

const { width } = Dimensions.get('window');

const CardSlider: React.FC<CardSliderProps> = ({
    autoPlay = true,
    autoPlayInterval = 3000,
    withImage = false,
    withContainerAutoplay = false,
    withContainerIndicators = false,
    withContainerAutoplayToggle = false,
    withContainerButton = false,
}) => {
    const tailwind = useTailwind();
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [cards] = useState<SliderCard[]>(getSliderData());
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<any>(null);
    const animatedValue = useRef(new Animated.Value(1)).current;
    const [autoPlay_, setAutoPlay_] = useState(autoPlay);

    useEffect(() => {
        let interval: any = 6000;
        // NodeJS.Timeout;

        if (autoPlay_) {
            interval = setInterval(() => {
                if (activeIndex === cards.length - 1) {
                    setActiveIndex(0);
                    flatListRef.current?.scrollTo({ x: 0, animated: true });
                } else {
                    setActiveIndex(activeIndex + 1);
                    flatListRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
                }
            }, autoPlayInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeIndex, autoPlay_, autoPlayInterval, cards.length]);

    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleManualScroll = (index: number) => {
        setActiveIndex(index);
        flatListRef.current?.scrollTo({ x: width * index, animated: true });
    };

    const handleCardPress = (card: SliderCard) => {
        if (card.buttonLink) {
            router.push(card.buttonLink);
        }
    };

    return (
        <View style={[styles.container, tailwind('mb-4')]}>
            <Animated.ScrollView
                ref={flatListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setActiveIndex(newIndex);
                }}
                style={styles.scrollView}
            >
                {cards.map((card, index) => (
                    <Animated.View
                        key={card.id}
                        style={[
                            styles.cardContainer,
                            {
                                width: width - 48,
                                marginVertical: 12,
                                backgroundColor: card.backgroundColor,
                                transform: [{ scale: activeIndex === index ? animatedValue : 1 }]
                            },
                            tailwind('rounded-xl shadow-lg overflow-hidden px-4 py-8')
                        ]}
                    >
                        {withImage && <View style={styles.bannerContainer}>
                            <Image source={card.bannerImage} style={[styles.bannerImage, tailwind('rounded-xl')]} />
                        </View>}
                        <View style={[styles.cardContent, tailwind('p-4')]}>
                            <Text style={[styles.cardTitle, tailwind('text-white font-bold text-xl mb-2')]}>
                                {card.title}
                            </Text>
                            <Text style={[styles.cardDescription, tailwind('text-white text-base mb-4')]}>
                                {card.description}
                            </Text>
                            {card.buttonText && (
                                <TouchableOpacity
                                    style={[styles.cardButton, tailwind('bg-white rounded-full py-2 px-4')]}
                                    onPress={() => handleCardPress(card)}
                                >
                                    <Text style={[styles.buttonText, { color: card.backgroundColor }]}>
                                        {card.buttonText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                ))}
            </Animated.ScrollView>

            <View style={[styles.controls, tailwind('flex-row justify-between items-center mt-2')]}>
                <TouchableOpacity
                    style={[styles.controlButton, tailwind('bg-white rounded-full p-2')]}
                    onPress={() => {
                        const newIndex = activeIndex === 0 ? cards.length - 1 : activeIndex - 1;
                        handleManualScroll(newIndex);
                    }}
                >
                    <MaterialIcons name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>

                <View style={[styles.indicators, tailwind('flex-row justify-center')]}>
                    {cards.map((_, index) => (
                        <TouchableOpacity
                            key={index+1}
                            style={[
                                styles.indicator,
                                tailwind('mx-1 rounded-full'),
                                activeIndex === index ?
                                    [styles.activeIndicator, tailwind('bg-white')] :
                                    [styles.inactiveIndicator, tailwind('bg-gray-400')]
                            ]}
                            onPress={() => handleManualScroll(index)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.controlButton, tailwind('bg-white rounded-full p-2')]}
                    onPress={() => {
                        const newIndex = activeIndex === cards.length - 1 ? 0 : activeIndex + 1;
                        handleManualScroll(newIndex);
                    }}
                >
                    <MaterialIcons name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {withContainerAutoplay &&
                <View style={[styles.autoplayToggle, tailwind('flex-row items-center justify-center mt-2')]}>
                    <Text style={tailwind('text-gray-600 mr-2')}>Automatico</Text>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            tailwind('rounded-full px-3 py-1'),
                            autoPlay_ ? tailwind('bg-blue-500') : tailwind('bg-gray-300')
                        ]}
                        onPress={() => setAutoPlay_(!autoPlay_)}
                    >
                        <Text style={tailwind('text-white text-xs')}>
                            {autoPlay_ ? 'Si' : 'No'}
                        </Text>
                    </TouchableOpacity>
                </View>}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    scrollView: {
        overflow: 'visible',
        paddingHorizontal: 24,
    },
    cardContainer: {
        marginHorizontal: 6,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        justifyContent: 'center',
    },
    bannerContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bannerImage: {
        width: '90%',
        height: '100%',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    cardDescription: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 16,
    },
    cardButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    buttonText: {
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 8,
    },
    controlButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
    },
    inactiveIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    autoplayToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
});

export default CardSlider;