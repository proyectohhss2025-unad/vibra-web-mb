import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/shared/components/ui/CustomButton';

/**
 * Interfaz para las preguntas configurables del juego de dados
 */
export interface DiceQuestion {
    id: string;
    questionText: string;
    diceValue: number; // Valor del dado asociado a esta pregunta (1-6)
    type: 'open' | 'multiple';
    options?: string[];
    correctAnswer: string;
}

/**
 * Propiedades del componente DiceGameConfig
 */
interface DiceGameConfigProps {
    onSaveQuestions: (questions: DiceQuestion[]) => void;
    initialQuestions?: DiceQuestion[];
}

/**
 * Componente para configurar las preguntas del juego de dados
 * @param {DiceGameConfigProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente renderizado
 */
const DiceGameConfig: React.FC<DiceGameConfigProps> = ({ onSaveQuestions, initialQuestions = [] }) => {
    const [questions, setQuestions] = useState<DiceQuestion[]>(initialQuestions);
    const [editingQuestion, setEditingQuestion] = useState<DiceQuestion | null>(null);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState<'open' | 'multiple'>('multiple');
    const [diceValue, setDiceValue] = useState<number>(1);
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    /**
     * Resetea el formulario de edición
     */
    const resetForm = () => {
        setQuestionText('');
        setQuestionType('multiple');
        setDiceValue(1);
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setEditingQuestion(null);
        setIsEditing(false);
    };

    /**
     * Maneja la adición de una nueva opción en preguntas de tipo múltiple
     */
    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    /**
     * Maneja la eliminación de una opción en preguntas de tipo múltiple
     * @param {number} index - Índice de la opción a eliminar
     */
    const handleRemoveOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    /**
     * Maneja el cambio de texto en una opción
     * @param {string} text - Nuevo texto de la opción
     * @param {number} index - Índice de la opción a modificar
     */
    const handleOptionChange = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    /**
     * Valida el formulario antes de guardar
     * @returns {boolean} True si el formulario es válido, false en caso contrario
     */
    const validateForm = (): boolean => {
        if (!questionText.trim()) {
            Alert.alert('Error', 'El texto de la pregunta es obligatorio');
            return false;
        }

        if (questionType === 'multiple') {
            // Filtrar opciones vacías
            const validOptions = options.filter(opt => opt.trim() !== '');

            if (validOptions.length < 2) {
                Alert.alert('Error', 'Debes proporcionar al menos 2 opciones válidas');
                return false;
            }

            if (!validOptions.includes(correctAnswer)) {
                Alert.alert('Error', 'La respuesta correcta debe ser una de las opciones');
                return false;
            }
        } else if (!correctAnswer.trim()) {
            Alert.alert('Error', 'La respuesta correcta es obligatoria');
            return false;
        }

        // Verificar si ya existe una pregunta para este valor de dado
        const existingQuestion = questions.find(
            q => q.diceValue === diceValue && (!editingQuestion || q.id !== editingQuestion.id)
        );

        if (existingQuestion) {
            Alert.alert('Error', `Ya existe una pregunta para el valor ${diceValue} del dado`);
            return false;
        }

        return true;
    };

    /**
     * Maneja el guardado de una pregunta
     */
    const handleSaveQuestion = () => {
        if (!validateForm()) return;

        // Filtrar opciones vacías
        const validOptions = options.filter(opt => opt.trim() !== '');

        const newQuestion: DiceQuestion = {
            id: editingQuestion?.id || Date.now().toString(),
            questionText,
            diceValue,
            type: questionType,
            options: questionType === 'multiple' ? validOptions : undefined,
            correctAnswer
        };

        let updatedQuestions: DiceQuestion[];

        if (isEditing) {
            // Actualizar pregunta existente
            updatedQuestions = questions.map(q =>
                q.id === editingQuestion?.id ? newQuestion : q
            );
        } else {
            // Añadir nueva pregunta
            updatedQuestions = [...questions, newQuestion];
        }

        setQuestions(updatedQuestions);
        onSaveQuestions(updatedQuestions);
        resetForm();
    };

    /**
     * Maneja la edición de una pregunta existente
     * @param {DiceQuestion} question - Pregunta a editar
     */
    const handleEditQuestion = (question: DiceQuestion) => {
        setEditingQuestion(question);
        setQuestionText(question.questionText);
        setQuestionType(question.type);
        setDiceValue(question.diceValue);
        setOptions(question.options || ['', '', '', '']);
        setCorrectAnswer(question.correctAnswer);
        setIsEditing(true);
    };

    /**
     * Maneja la eliminación de una pregunta
     * @param {string} id - ID de la pregunta a eliminar
     */
    const handleDeleteQuestion = (id: string) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar esta pregunta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const updatedQuestions = questions.filter(q => q.id !== id);
                        setQuestions(updatedQuestions);
                        onSaveQuestions(updatedQuestions);
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Configuración de Preguntas</Text>

            {/* Formulario de edición */}
            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>
                    {isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Valor del dado:</Text>
                    <View style={styles.diceValueContainer}>
                        {[1, 2, 3, 4, 5, 6].map(value => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.diceValueButton,
                                    diceValue === value && styles.selectedDiceValue
                                ]}
                                onPress={() => setDiceValue(value)}
                            >
                                <Text
                                    style={[
                                        styles.diceValueText,
                                        diceValue === value && styles.selectedDiceValueText
                                    ]}
                                >
                                    {value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Texto de la pregunta:</Text>
                    <TextInput
                        style={styles.input}
                        value={questionText}
                        onChangeText={setQuestionText}
                        placeholder="Escribe la pregunta aquí..."
                        multiline
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tipo de pregunta:</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                questionType === 'multiple' && styles.selectedTypeButton
                            ]}
                            onPress={() => setQuestionType('multiple')}
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    questionType === 'multiple' && styles.selectedTypeButtonText
                                ]}
                            >
                                Opción múltiple
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                questionType === 'open' && styles.selectedTypeButton
                            ]}
                            onPress={() => setQuestionType('open')}
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    questionType === 'open' && styles.selectedTypeButtonText
                                ]}
                            >
                                Respuesta abierta
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {questionType === 'multiple' ? (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Opciones:</Text>
                        {options.map((option, index) => (
                            <View key={index+1} style={styles.optionContainer}>
                                <TextInput
                                    style={styles.optionInput}
                                    value={option}
                                    onChangeText={(text) => handleOptionChange(text, index)}
                                    placeholder={`Opción ${index + 1}`}
                                />
                                <TouchableOpacity
                                    style={styles.removeOptionButton}
                                    onPress={() => handleRemoveOption(index)}
                                    disabled={options.length <= 2}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={24}
                                        color={options.length <= 2 ? '#CBD5E0' : '#EF4444'}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addOptionButton}
                            onPress={handleAddOption}
                        >
                            <Ionicons name="add-circle" size={24} color="#4F46E5" />
                            <Text style={styles.addOptionText}>Añadir opción</Text>
                        </TouchableOpacity>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Respuesta correcta:</Text>
                            <View style={styles.correctAnswerContainer}>
                                {options.filter(opt => opt.trim() !== '').map((option, index) => (
                                    <TouchableOpacity
                                        key={index+1}
                                        style={[
                                            styles.correctAnswerButton,
                                            correctAnswer === option && styles.selectedCorrectAnswer
                                        ]}
                                        onPress={() => setCorrectAnswer(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.correctAnswerText,
                                                correctAnswer === option && styles.selectedCorrectAnswerText
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Respuesta correcta:</Text>
                        <TextInput
                            style={styles.input}
                            value={correctAnswer}
                            onChangeText={setCorrectAnswer}
                            placeholder="Escribe la respuesta correcta aquí..."
                        />
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <CustomButton
                        title={isEditing ? 'Actualizar' : 'Guardar'}
                        variantColor="blue"
                        neonEffect={true}
                        onPress={handleSaveQuestion}
                        icon="save"
                        style={styles.saveButton}
                    />

                    {isEditing && (
                        <CustomButton
                            title="Cancelar"
                            variantColor="gray"
                            onPress={resetForm}
                            icon="close"
                            style={styles.cancelButton}
                        />
                    )}
                </View>
            </View>

            {/* Lista de preguntas configuradas */}
            <View style={styles.questionListContainer}>
                <Text style={styles.sectionTitle}>Preguntas Configuradas</Text>

                {questions.length === 0 ? (
                    <Text style={styles.emptyText}>No hay preguntas configuradas</Text>
                ) : (
                    questions.map((question, index) => (
                        <View key={question.id} style={styles.questionCard}>
                            <View style={styles.questionHeader}>
                                <View style={styles.diceValueBadge}>
                                    <Text style={styles.diceValueBadgeText}>{question.diceValue}</Text>
                                </View>
                                <Text style={styles.questionTypeText}>
                                    {question.type === 'multiple' ? 'Opción múltiple' : 'Respuesta abierta'}
                                </Text>
                            </View>

                            <Text style={styles.questionCardText}>{question.questionText}</Text>

                            <View style={styles.questionActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEditQuestion(question)}
                                >
                                    <Ionicons name="pencil" size={20} color="#4F46E5" />
                                    <Text style={styles.editButtonText}>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteQuestion(question.id)}
                                >
                                    <Ionicons name="trash" size={20} color="#EF4444" />
                                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    diceValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    diceValueButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDiceValue: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    diceValueText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4B5563',
    },
    selectedDiceValueText: {
        color: 'white',
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginHorizontal: 4,
        alignItems: 'center',
    },
    selectedTypeButton: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
    },
    selectedTypeButtonText: {
        color: 'white',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionInput: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    removeOptionButton: {
        marginLeft: 8,
    },
    addOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        marginTop: 8,
    },
    addOptionText: {
        marginLeft: 8,
        color: '#4F46E5',
        fontWeight: '500',
    },
    correctAnswerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    correctAnswerButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 8,
        margin: 4,
    },
    selectedCorrectAnswer: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    correctAnswerText: {
        color: '#4B5563',
    },
    selectedCorrectAnswerText: {
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    saveButton: {
        flex: 1,
        marginRight: 8,
    },
    cancelButton: {
        flex: 1,
        marginLeft: 8,
    },
    questionListContainer: {
        marginBottom: 24,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 16,
        fontStyle: 'italic',
        marginTop: 16,
    },
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    diceValueBadge: {
        backgroundColor: '#4F46E5',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    diceValueBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    questionTypeText: {
        color: '#6B7280',
        fontSize: 14,
    },
    questionCardText: {
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 16,
    },
    questionActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginRight: 16,
    },
    editButtonText: {
        color: '#4F46E5',
        marginLeft: 4,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    deleteButtonText: {
        color: '#EF4444',
        marginLeft: 4,
    },
});

export default DiceGameConfig;