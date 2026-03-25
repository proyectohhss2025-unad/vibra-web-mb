import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../shared/components/ui/CustomButton';
import { useTailwind } from 'tailwind-rn';

const sponsors = [
    {
        id: 1,
        name: 'UNAD',
        logo: require('../../assets/sponsors/logo_unad.png'),
        description: 'Universidad Nacional Abierta y a Distancia',
        fullDescription: 'La Universidad Nacional Abierta y a Distancia (UNAD) es una institución pública de educación superior, autónoma, innovadora y flexible.'
    },
    {
        id: 2,
        name: 'SEMILLERO',
        logo: require('../../assets/sponsors/logo_semillero.jpg'),
        description: 'Semillero de Investigación',
        fullDescription: 'Semillero de investigación dedicado al desarrollo de tecnologías innovadoras.'
    },
    {
        id: 3,
        name: 'SEMILLERO',
        logo: require('../../assets/sponsors/ciencia_curare.png'),
        description: 'Semillero 2',
        fullDescription: 'Grupo de investigación enfocado en el avance de la ciencia y la tecnología.'
    }
];

const developers = [
    {
        id: 2,
        name: 'Ermes Guarnizo Motta',
        role: 'Designer and Product Owner',
        avatar: require('../../assets/sponsors/ermes_guarnizo_motta.jpeg'),
        bio: 'Diseñador UX/UI con experiencia en la creación de experiencias de usuario intuitivas y atractivas. Product Owner del proyecto Vibra.'
    },
    {
        id: 1,
        name: 'Yovany Suárez Silva',
        role: 'Software engineer and Lead developer',
        avatar: require('../../assets/sponsors/6803296.jpeg'),
        bio: 'Ingeniero de software con amplia experiencia en desarrollo de aplicaciones móviles y web. Líder técnico del proyecto Vibra.'
    }
];

const AboutScreen = () => {
    const router = useRouter();
    const tailwind = useTailwind();
    const fadeAnim = new Animated.Value(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemType, setItemType] = useState('');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleItemPress = (item: any, type: any) => {
        setSelectedItem(item);
        setItemType(type);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Animated.View style={[styles.animatedView, { opacity: modalVisible ? fadeAnim : 1 }]}>
                    <Text style={styles.title}>
                        Acerca del equipo Vibra
                    </Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Nuestros patrocinadores
                        </Text>
                        <View style={styles.cardContainer}>
                            {sponsors.map((sponsor) => (
                                <TouchableOpacity
                                    key={sponsor.id}
                                    onPress={() => handleItemPress(sponsor, 'sponsor')}
                                >
                                    <View style={styles.card}>
                                        <Image
                                            source={sponsor.logo}
                                            style={styles.sponsorImage}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.cardTitle}>{sponsor.name}</Text>
                                        <Text style={styles.cardDescription}>
                                            {sponsor.description}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Equipo de ingeniería y desarrollo
                        </Text>
                        <View style={styles.cardContainer}>
                            {developers.map((dev) => (
                                <TouchableOpacity
                                    key={dev.id}
                                    onPress={() => handleItemPress(dev, 'developer')}
                                >
                                    <View style={styles.card}>
                                        <Image
                                            source={dev.avatar}
                                            style={styles.avatarImage}
                                        />
                                        <Text style={styles.cardTitle}>{dev.name}</Text>
                                        <Text style={styles.cardRole}>{dev.role}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <CustomButton
                title="Ir atras"
                onPress={() => router.back()}
                style={{ fontSize: 22, marginHorizontal: 20, marginBottom: 20 }}
                icon={"arrow-right"}
                iconPosition="right"
                iconSize={24}
                neonEffect={true}
                variantColor="red"
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                <Image
                                    source={itemType === 'sponsor' ? selectedItem.logo : selectedItem.avatar}
                                    style={itemType === 'sponsor' ? styles.modalSponsorImage : styles.modalAvatarImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                                {itemType === 'sponsor' ? (
                                    <Text style={styles.modalDescription}>{selectedItem.fullDescription}</Text>
                                ) : (
                                    <>
                                        <Text style={styles.modalRole}>{selectedItem.role}</Text>
                                        <Text style={styles.modalDescription}>{selectedItem.bio}</Text>
                                    </>
                                )}
                                <CustomButton
                                    title="Ir atras"
                                    onPress={() => setModalVisible(false)}
                                    style={{ fontSize: 22 }}
                                    icon={"arrow-right"}
                                    iconPosition="right"
                                    iconSize={24}
                                    neonEffect={true}
                                    variantColor="red"
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1
    },
    animatedView: {
        padding: 10
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
        textAlign: 'center'
    },
    section: {
        marginBottom: 32
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
        textAlign: 'center'
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: 'white',
        padding: 6,
        paddingTop: 12,
        paddingBottom: 20,
        borderRadius: 20,
        margin: 6,
        width: 160,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    sponsorImage: {
        width: 90,
        height: 90,
        marginBottom: 6
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 40,
        marginBottom: 8
    },
    cardTitle: {
        fontWeight: '500',
        color: '#1F2937'
    },
    cardDescription: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center'
    },
    cardRole: {
        fontSize: 14,
        color: '#4B5563'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center'
    },
    modalSponsorImage: {
        width: 120,
        height: 120,
        marginBottom: 10
    },
    modalAvatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center'
    },
    modalRole: {
        fontSize: 18,
        color: '#4B5563',
        marginBottom: 10,
        textAlign: 'center'
    },
    modalDescription: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20
    },
    modalButton: {
        width: '100%'
    }
});

export default AboutScreen;
