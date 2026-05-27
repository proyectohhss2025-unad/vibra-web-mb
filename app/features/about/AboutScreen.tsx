import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TamaguiButton from '@/shared/components/ui/tamagui/TamaguiButton';
import { useTailwind } from 'tailwind-rn';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const sponsors = [
    {
        id: 1,
        name: 'UNAD',
        logo: require('../../assets/sponsors/logo_unad.png'),
        description: 'Universidad Nacional Abierta y a Distancia',
        fullDescription: 'La Universidad Nacional Abierta y a Distancia (UNAD) es una institución pública de educación superior, autónoma, innovadora y flexible.',
        url: 'https://www.unad.edu.co/'
    },
    {
        id: 2,
        name: 'SEMILLERO',
        logo: require('../../assets/sponsors/logo_semillero.jpg'),
        description: 'Semillero de Investigación',
        fullDescription: 'Semillero de investigación dedicado al desarrollo de tecnologías innovadoras.',
        url: ''
    },
    {
        id: 3,
        name: 'SEMILLERO',
        logo: require('../../assets/sponsors/ciencia_curare.png'),
        description: 'Semillero 2',
        fullDescription: 'Grupo de investigación enfocado en el avance de la ciencia y la tecnología.',
        url: ''
    }
];

const developers = [
    {
        id: 1,
        name: 'Ermes Guarnizo Motta',
        role: 'Designer and Product Owner',
        avatar: require('../../assets/sponsors/ermes_guarnizo_motta.jpeg'),
        bio: 'Diseñador UX/UI con experiencia en la creación de experiencias de usuario intuitivas y atractivas. Product Owner del proyecto Vibra.',
        url: ''
    },
    {
        id: 2,
        name: 'Yovany Suárez Silva',
        role: 'Software Engineer & Lead Developer',
        avatar: require('../../assets/sponsors/6803296.jpeg'),
        bio: 'Ingeniero de software con amplia experiencia en desarrollo de aplicaciones móviles y web. Líder técnico del proyecto Vibra.',
        url: ''
    },
    {
        id: 3,
        name: 'Lic. Javier Miranda',
        role: 'Líder de Investigación',
        avatar: require('../../assets/sponsors/javier_miranda.png'),
        bio: 'Licenciado con amplia experiencia en investigación. Líder del equipo de investigación del proyecto Vibra.',
        url: ''
    }
];

const AboutScreen = () => {
    const router = useRouter();
    const tailwind = useTailwind();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemType, setItemType] = useState('');

    // Card press state
    const [pressedCardId, setPressedCardId] = useState<number | null>(null);

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Shimmer animation (continuous)
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleItemPress = (item: any, type: any) => {
        setSelectedItem(item);
        setItemType(type);
        setModalVisible(true);
    };

    const handleCardPressIn = (id: number) => {
        setPressedCardId(id);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handleCardPressOut = () => {
        setPressedCardId(null);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Shimmer overlay component
    const ShimmerOverlay = () => {
        const translateX = shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-200, 200],
        });

        return (
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        );
    };

    // Card component with glassmorphism and animations
    const GlassCard = ({ item, type, onPress }: { item: any; type: string; onPress: () => void }) => {
        const isPressed = pressedCardId === item.id;

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={() => handleCardPressIn(item.id)}
                    onPressOut={handleCardPressOut}
                    onPress={onPress}
                >
                    <View style={styles.glassCard}>
                        <ShimmerOverlay />
                        {type === 'sponsor' ? (
                            <Image
                                source={item.logo}
                                style={styles.sponsorImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <Image
                                source={item.avatar}
                                style={styles.avatarImage}
                            />
                        )}
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        {type === 'sponsor' ? (
                            <Text style={styles.cardDescription}>{item.description}</Text>
                        ) : (
                            <Text style={styles.cardRole}>{item.role}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Animated.View style={[styles.animatedView, { opacity: fadeAnim }]}>
                    {/* Header with gradient */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#0066FF', '#00CCFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerGradient}
                        >
                            <MaterialIcons name="groups" size={28} color="white" style={styles.headerIcon} />
                            <Text style={styles.headerTitle}>Acerca del equipo Vibra</Text>
                        </LinearGradient>
                    </View>

                    {/* Sponsors section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nuestros patrocinadores</Text>
                        <View style={styles.cardContainer}>
                            {sponsors.map((sponsor) => (
                                <GlassCard
                                    key={sponsor.id}
                                    item={sponsor}
                                    type="sponsor"
                                    onPress={() => handleItemPress(sponsor, 'sponsor')}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Developers section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Equipo de ingeniería y desarrollo</Text>
                        <View style={styles.cardContainer}>
                            {developers.map((dev) => (
                                <GlassCard
                                    key={dev.id}
                                    item={dev}
                                    type="developer"
                                    onPress={() => handleItemPress(dev, 'developer')}
                                />
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Back button */}
            <View style={styles.backButtonContainer}>
                <TamaguiButton
                    title="Ir atrás"
                    onPress={() => router.back()}
                    icon="arrow-right"
                    iconPosition="right"
                    iconSize={24}
                    neonEffect={true}
                    variantColor="blue"
                    style={styles.backButton}
                />
            </View>

            {/* Modal - Style like Login recover modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        {selectedItem && (
                            <>
                                <View style={styles.modalHeader}>
                                    {itemType === 'sponsor' ? (
                                        <Image
                                            source={selectedItem.logo}
                                            style={styles.modalSponsorImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Image
                                            source={selectedItem.avatar}
                                            style={styles.modalAvatarImage}
                                        />
                                    )}
                                </View>
                                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                                {itemType === 'sponsor' ? (
                                    <Text style={styles.modalDescription}>{selectedItem.fullDescription}</Text>
                                ) : (
                                    <>
                                        <Text style={styles.modalRole}>{selectedItem.role}</Text>
                                        <Text style={styles.modalDescription}>{selectedItem.bio}</Text>
                                    </>
                                )}
                                {selectedItem?.url ? (
                                    <TouchableOpacity
                                        style={styles.linkButton}
                                        onPress={() => {
                                            Linking.openURL(selectedItem.url);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <MaterialIcons name="open-in-new" size={18} color="#0066FF" />
                                        <Text style={styles.linkText}>Visitar sitio web</Text>
                                    </TouchableOpacity>
                                ) : null}
                                <TamaguiButton
                                    title="Cerrar"
                                    onPress={() => setModalVisible(false)}
                                    icon="cancel"
                                    iconSize={20}
                                    neonEffect={true}
                                    variantColor="gray"
                                    style={styles.modalButton}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    scrollView: {
        flex: 1,
    },
    animatedView: {
        padding: 16,
        paddingBottom: 100,
    },
    headerContainer: {
        marginBottom: 24,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    headerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 15,
    },
    headerIcon: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
        textAlign: 'center',
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        paddingTop: 16,
        paddingBottom: 20,
        borderRadius: 20,
        margin: 8,
        width: width * 0.4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
        // Neon glow effect
        shadowColor: '#00CCFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: -100,
        width: 100,
        height: '200%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: [{ rotate: '20deg' }],
    },
    sponsorImage: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'rgba(0, 204, 255, 0.5)',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    cardRole: {
        fontSize: 12,
        color: '#00CCFF',
        textAlign: 'center',
    },
    backButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    backButton: {
        width: '80%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '85%',
        maxWidth: 350,
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
    },
    modalHeader: {
        marginBottom: 16,
    },
    modalSponsorImage: {
        width: 100,
        height: 100,
        marginBottom: 12,
    },
    modalAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#0066FF',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalRole: {
        fontSize: 16,
        color: '#0066FF',
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    modalDescription: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalButton: {
        width: '100%',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0066FF',
        backgroundColor: 'rgba(0, 102, 255, 0.05)',
    },
    linkText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default AboutScreen;