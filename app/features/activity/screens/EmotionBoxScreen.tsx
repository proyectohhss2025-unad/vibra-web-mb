import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EmotionBoxActivity from '../components/EmotionBoxActivity';
import useUser from '@/context/UserContext';
import { EmotionConfig, EmotionActivityResult } from '../_types/emotion-box';
import { ActivityService } from '@shared/services/api/api';

/**
 * Pantalla para la actividad de Caja de Emociones
 * Permite configurar y realizar la actividad de clasificación de emociones
 * @returns {JSX.Element} Componente EmotionBoxScreen
 */
const DEFAULT_EMOTIONS: EmotionConfig[] = [
    { id: '1', name: 'alegría', type: 'sana' },
    { id: '2', name: 'gratitud', type: 'sana' },
    { id: '3', name: 'tranquilidad', type: 'sana' },
    { id: '4', name: 'amor', type: 'sana' },
    { id: '5', name: 'tristeza', type: 'gestionar' },
    { id: '6', name: 'enojo', type: 'gestionar' },
    { id: '7', name: 'ansiedad', type: 'gestionar' },
    { id: '8', name: 'miedo', type: 'gestionar' },
];

// Mapea la categoría del backend al tipo de la app móvil
const mapCategoryToType = (category?: string): 'sana' | 'gestionar' => {
    switch (category) {
        case 'Positiva': return 'sana';
        case 'Negativa': return 'gestionar';
        default: return 'sana';
    }
};

interface EmotionBoxScreenProps {
    emotions?: Array<{ id: string; name: string; type: 'sana' | 'gestionar'; imageUrl?: string }>;
    timeLimit?: number;
    /** ID real de la actividad (MongoId) para registrar la completación del juego. Opcional: si no llega, el juego no persiste el resultado. */
    activityId?: string;
}

const EmotionBoxScreen: React.FC<EmotionBoxScreenProps> = ({ emotions: propEmotions, timeLimit: propTimeLimit, activityId }) => {
    const tailwind = useTailwind();
    const router = useRouter();
    const { user } = useUser();

    // Estado para controlar si estamos en modo configuración o actividad
    const [isConfigMode, setIsConfigMode] = useState<boolean>(true);
    const [isLoadingEmotions, setIsLoadingEmotions] = useState(true);

    // Estado para la configuración de la actividad
    const [activityConfig, setActivityConfig] = useState({
        timeLimit: 120,
        showInstructions: true,
    });

    // Estado para las emociones configuradas
    const [configuredEmotions, setConfiguredEmotions] = useState<EmotionConfig[]>(DEFAULT_EMOTIONS);

    // Cargar emociones desde el API al montar
    useEffect(() => {
        const fetchEmotions = async () => {
            try {
                const response = await ActivityService.getEmotions(1, 50);
                if (response?.data && response.data.length > 0) {
                    const mapped: EmotionConfig[] = response.data.map((e: any) => ({
                        id: e._id ?? e.id ?? String(Math.random()),
                        name: (e.name ?? '').toLowerCase(),
                        type: mapCategoryToType(e.category),
                    }));
                    setConfiguredEmotions(mapped);
                }
            } catch (err) {
                console.log('Error cargando emociones del API, usando defaults:', err);
                // Mantiene DEFAULT_EMOTIONS
            } finally {
                setIsLoadingEmotions(false);
            }
        };
        fetchEmotions();
    }, []);

    // Estado para la nueva emoción que se está añadiendo
    const [newEmotion, setNewEmotion] = useState<Partial<EmotionConfig>>({
        name: '',
        type: 'sana',
    });

    // Estado para los resultados de la actividad
    const [activityResult, setActivityResult] = useState<EmotionActivityResult | null>(null);

    // Manejar la finalización de la actividad
    const handleActivityComplete = (result: EmotionActivityResult) => {
        setActivityResult(result);
        console.log('Actividad completada:', result);
        // Aquí se podría navegar a una pantalla de resultados o mostrar un modal
    };

    // Añadir una nueva emoción a la configuración
    const handleAddEmotion = () => {
        if (!newEmotion.name) return;

        const emotion: EmotionConfig = {
            id: Date.now().toString(),
            name: newEmotion.name,
            type: newEmotion.type || 'sana',
        };

        setConfiguredEmotions([...configuredEmotions, emotion]);
        setNewEmotion({ name: '', type: 'sana' });
    };

    // Eliminar una emoción de la configuración
    const handleRemoveEmotion = (id: string) => {
        setConfiguredEmotions(configuredEmotions.filter(emotion => emotion.id !== id));
    };

    // Cambiar entre modo configuración y actividad
    const toggleMode = () => {
        setIsConfigMode(!isConfigMode);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Cabecera */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {isConfigMode ? 'Configurar Actividad' : 'Caja de Emociones'}
                </Text>

                <TouchableOpacity
                    style={styles.modeToggleButton}
                    onPress={toggleMode}
                >
                    <MaterialIcons
                        name={isConfigMode ? 'play-arrow' : 'settings'}
                        size={24}
                        color="#4B5563"
                    />
                </TouchableOpacity>
            </View>

            {isLoadingEmotions ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando emociones...</Text>
                </View>
            ) : isConfigMode ? (
                // Modo de configuración
                <ScrollView style={styles.configContainer}>
                    <View style={styles.configSection}>
                        <Text style={styles.sectionTitle}>Configuración General</Text>

                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Tiempo límite (segundos):</Text>
                            <TextInput
                                style={styles.configInput}
                                value={activityConfig.timeLimit.toString()}
                                onChangeText={(text) => {
                                    const value = Number.parseInt(text) || 0;
                                    setActivityConfig({ ...activityConfig, timeLimit: value });
                                }}
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Mostrar instrucciones:</Text>
                            <Switch
                                value={activityConfig.showInstructions}
                                onValueChange={(value) => {
                                    setActivityConfig({ ...activityConfig, showInstructions: value });
                                }}
                            />
                        </View>
                    </View>

                    <View style={styles.configSection}>
                        <Text style={styles.sectionTitle}>Emociones Configuradas</Text>

                        {configuredEmotions.map((emotion) => (
                            <View key={emotion.id} style={styles.emotionItem}>
                                <View style={styles.emotionInfo}>
                                    <Text style={styles.emotionName}>{emotion.name}</Text>
                                    <Text
                                        style={[styles.emotionType,
                                        emotion.type === 'sana' ? styles.healthyType : styles.manageType
                                        ]}
                                    >
                                        {emotion.type === 'sana' ? 'Emoción Sana' : 'Emoción por Gestionar'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveEmotion(emotion.id)}
                                >
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.configSection}>
                        <Text style={styles.sectionTitle}>Añadir Nueva Emoción</Text>

                        <View style={styles.addEmotionContainer}>
                            <TextInput
                                style={styles.emotionInput}
                                placeholder="Nombre de la emoción"
                                value={newEmotion.name}
                                onChangeText={(text) => setNewEmotion({ ...newEmotion, name: text })}
                            />

                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        newEmotion.type === 'sana' ? styles.activeTypeButton : {},
                                    ]}
                                    onPress={() => setNewEmotion({ ...newEmotion, type: 'sana' })}
                                >
                                    <Text style={styles.typeButtonText}>Sana</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        newEmotion.type === 'gestionar' ? styles.activeTypeButton : {},
                                    ]}
                                    onPress={() => setNewEmotion({ ...newEmotion, type: 'gestionar' })}
                                >
                                    <Text style={styles.typeButtonText}>Por Gestionar</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddEmotion}
                                disabled={!newEmotion.name}
                            >
                                <Text style={styles.addButtonText}>Añadir Emoción</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={toggleMode}
                    >
                        <Text style={styles.startButtonText}>Iniciar Actividad</Text>
                        <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                // Modo de actividad
                <EmotionBoxActivity
                    activityId={activityId ?? 'emotion-box-activity'}
                    emotions={configuredEmotions}
                    timeLimit={activityConfig.timeLimit}
                    onComplete={handleActivityComplete}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    modeToggleButton: {
        padding: 8,
    },
    configContainer: {
        flex: 1,
        padding: 16,
    },
    configSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    configLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    configInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        padding: 8,
        width: 80,
        textAlign: 'center',
    },
    emotionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 8,
    },
    emotionInfo: {
        flex: 1,
    },
    emotionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        textTransform: 'capitalize',
    },
    emotionType: {
        fontSize: 12,
        marginTop: 2,
    },
    healthyType: {
        color: '#10B981',
    },
    manageType: {
        color: '#EF4444',
    },
    removeButton: {
        padding: 8,
    },
    addEmotionContainer: {
        marginTop: 8,
    },
    emotionInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    activeTypeButton: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    typeButtonText: {
        color: '#4B5563',
    },
    addButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    startButton: {
        flexDirection: 'row',
        backgroundColor: '#10B981',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default EmotionBoxScreen;