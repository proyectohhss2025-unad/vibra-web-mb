import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTailwind } from 'tailwind-rn';
import api from '@shared/services/api/api';
import { showTamaguiAlert } from '@shared/components/ui/tamagui';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserIllustration from '@shared/components/illustrations/UserIllustration';

const RegisterForm = () => {
    const tailwind = useTailwind();
    const router = useRouter();

    // Form state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [typeDocument, setTypeDocument] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [hightSchool, setHightSchool] = useState('');
    const [course, setCourse] = useState('');

    // Options state (tipos any porque vienen de API)
    const [typeDocumentOptions, setTypeDocumentOptions] = useState<any[]>([]);
    const [roleOptions, setRoleOptions] = useState<any[]>([]);
    const [hightSchoolOptions, setHightSchoolOptions] = useState<any[]>([]);
    const [courseOptions, setCourseOptions] = useState<any[]>([]);

    // Loading states
    const [loadingForm, setLoadingForm] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Modal states
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [resultType, setResultType] = useState<'success' | 'error'>('success');
    const [resultMessage, setResultMessage] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper: limpia un error del objeto en vez de dejarlo como string vacío
    const clearError = (field: string) => {
        if (errors[field]) {
            const next = { ...errors };
            delete next[field];
            setErrors(next);
        }
    };

    // Get role name for badge
    const getRoleName = () => {
        const selectedRole = roleOptions.find((r: any) => r._id === role);
        return selectedRole?.name || '';
    };

    // Load options on mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [typeDocRes, rolesRes, schoolsRes] = await Promise.all([
                    api.get(`/api/document-types/all`),
                    api.get(`/api/roles?page=1&limit=50`),
                    api.get(`/api/company?page=1&rows=50`)
                ]);
                setTypeDocumentOptions([{ _id: '__placeholder__', description: 'Seleccione un tipo', name: 'Seleccione un tipo' }, ...typeDocRes.data]);
                setRoleOptions([{ _id: '', name: 'Seleccione un rol' }, ...rolesRes.data.items]);
                setHightSchoolOptions([{ _id: '', name: 'Seleccione una institución' }, ...schoolsRes.data.companies]);
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, []);

    // Load courses when hightSchool changes
    useEffect(() => {
        const fetchCourses = async () => {
            if (hightSchool) {
                try {
                    const response = await api.get(`/api/courses?companyId=${hightSchool}&page=1&rows=50`);
                    setCourseOptions([{ _id: '', name: 'Seleccione un curso' }, ...response.data.courses]);
                } catch (error) {
                    console.error('Error fetching courses:', error);
                }
            } else {
                setCourseOptions([]);
                setCourse('');
            }
        };
        fetchCourses();
    }, [hightSchool]);

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // Min 8 chars, 1 number, 1 uppercase, 1 special char
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>\/?]).{8,}$/;
        return passwordRegex.test(password);
    };

    const validateDocument = (doc: string): boolean => {
        // Only numbers
        const docRegex = /^\d+$/;
        return docRegex.test(doc) && doc.length >= 8 && doc.length <= 10;
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullName) newErrors.fullName = 'El nombre completo es requerido';
        if (!username) newErrors.username = 'El nombre de usuario es requerido';
        if (!password) newErrors.password = 'La contraseña es requerida';
        else if (!validatePassword(password)) newErrors.password = 'Mínimo 8 caracteres, 1 número, 1 mayúscula y 1 carácter especial';
        if (!typeDocument) newErrors.typeDocument = 'Seleccione un tipo de documento';
        if (!documentNumber) newErrors.documentNumber = 'El número de documento es requerido';
        else if (!validateDocument(documentNumber)) newErrors.documentNumber = 'Solo números, 8-10 dígitos';
        if (!email) newErrors.email = 'El correo electrónico es requerido';
        else if (!validateEmail(email)) newErrors.email = 'Formato de email incorrecto';
        if (!role) newErrors.role = 'Seleccione un rol de usuario';
        if (!hightSchool) newErrors.hightSchool = 'Seleccione una institución educativa';
        if (!course) newErrors.course = 'Seleccione un curso';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreview = () => {
        if (validateForm()) {
            setPreviewModalVisible(true);
        } else {
            const firstError = Object.values(errors)[0];
            showTamaguiAlert('Validación', firstError);
        }
    };

    const handleConfirm = async () => {
        setPreviewModalVisible(false);
        setLoadingForm(true);

        const payload = {
            name: fullName,
            username,
            password,
            documentNumber,
            typeDocument,
            email,
            role,
            course,
            avatar: 'default-user.png'
        };

        try {
            const response = await api.post('/api/users/create', payload);
            setResultType('success');
            setResultMessage('¡Registro exitoso! El usuario ha sido creado correctamente.');
            setResultModalVisible(true);
        } catch (error: any) {
            setResultType('error');
            setResultMessage(error?.response?.data?.message || 'Error al crear el usuario. Intente nuevamente.');
            setResultModalVisible(true);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleResultModalClose = () => {
        setResultModalVisible(false);
        if (resultType === 'success') {
            setTimeout(() => router.push('/'), 1500);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    const getTypeDocumentLabel = () => {
        const selected = typeDocumentOptions.find((t: any) => t._id === typeDocument);
        return selected?.description || '';
    };

    const getHightSchoolLabel = () => {
        const selected = hightSchoolOptions.find((h: any) => h._id === hightSchool);
        return selected?.name || '';
    };

    const getCourseLabel = () => {
        const selected = courseOptions.find((c: any) => c._id === course);
        return selected?.name || '';
    };

    if (loadingOptions) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#0066FF" />
                <Text style={styles.loadingText}>Cargando opciones...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#0066FF', '#00CCFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerGradient}
                        >
                            <Text style={styles.headerTitle}>Registro de Usuario</Text>
                        </LinearGradient>
                    </View>

                    {/* User Illustration and Role Badge */}
                    <View style={styles.illustrationContainer}>
                        <UserIllustration size={80} />
                        {!!role && (
                            <View style={styles.badge}>
                                <MaterialIcons name="verified-user" size={16} color="white" />
                                <Text style={styles.badgeText}>{getRoleName()}</Text>
                            </View>
                        )}
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre completo</Text>
                            <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                                <MaterialIcons name="badge" size={22} color="#0066FF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su nombre completo"
                                    placeholderTextColor="#999"
                                    value={fullName}
                                    onChangeText={(text) => {
                                        setFullName(text);
                                        clearError('fullName');
                                    }}
                                />
                            </View>
                            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                        </View>

                        {/* Username */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de usuario</Text>
                            <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                                <MaterialIcons name="person" size={22} color="#0066FF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su usuario"
                                    placeholderTextColor="#999"
                                    value={username}
                                    onChangeText={(text) => {
                                        setUsername(text);
                                        clearError('username');
                                    }}
                                />
                            </View>
                            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                                <MaterialIcons name="lock" size={22} color="#0066FF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo 8 caracteres"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        clearError('password');
                                    }}
                                />
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Type Document */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipo de documento</Text>
                            <View style={[styles.inputWrapper, errors.typeDocument && styles.inputError]}>
                                <MaterialIcons name="description" size={22} color="#0066FF" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={typeDocument}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => {
                                        setTypeDocument(itemValue);
                                        clearError('typeDocument');
                                    }}
                                    dropdownIconColor="#0066FF"
                                >
                                    {typeDocumentOptions.map((option: any) => (
                                        <Picker.Item key={option._id || option.id || Math.random().toString(36)} label={option.description || option.name || 'Tipo'} value={option._id || option.id || ''} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.typeDocument && <Text style={styles.errorText}>{errors.typeDocument}</Text>}
                        </View>

                        {/* Document Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Número de documento</Text>
                            <View style={[styles.inputWrapper, errors.documentNumber && styles.inputError]}>
                                <MaterialIcons name="credit-card" size={22} color="#0066FF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Solo números"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={documentNumber}
                                    onChangeText={(text) => {
                                        setDocumentNumber(text);
                                        clearError('documentNumber');
                                    }}
                                />
                            </View>
                            {errors.documentNumber && <Text style={styles.errorText}>{errors.documentNumber}</Text>}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                <MaterialIcons name="email" size={22} color="#0066FF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        clearError('email');
                                    }}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Role */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rol de usuario</Text>
                            <View style={[styles.inputWrapper, errors.role && styles.inputError]}>
                                <MaterialIcons name="assignment-ind" size={22} color="#0066FF" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={role}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => {
                                        setRole(itemValue);
                                        clearError('role');
                                    }}
                                    dropdownIconColor="#0066FF"
                                >
                                    {roleOptions.map((option: any, index: number) => (
                                        <Picker.Item key={option._id || `role-${index}`} label={option.name || 'Rol'} value={option._id || ''} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
                        </View>

                        {/* Hight School */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Institución educativa</Text>
                            <View style={[styles.inputWrapper, errors.hightSchool && styles.inputError]}>
                                <MaterialIcons name="school" size={22} color="#0066FF" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={hightSchool}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => {
                                        setHightSchool(itemValue);
                                        setCourse('');
                                        clearError('hightSchool');
                                    }}
                                    dropdownIconColor="#0066FF"
                                >
                                    {hightSchoolOptions.map((option: any, index: number) => (
                                        <Picker.Item key={option._id || `school-${index}`} label={option.name || 'Institución'} value={option._id || ''} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.hightSchool && <Text style={styles.errorText}>{errors.hightSchool}</Text>}
                        </View>

                        {/* Course - only show if hightSchool is selected */}
                        {!!hightSchool && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Curso</Text>
                                <View style={[styles.inputWrapper, errors.course && styles.inputError]}>
                                    <MaterialIcons name="class" size={22} color="#0066FF" style={styles.inputIcon} />
                                    <Picker
                                        selectedValue={course}
                                        style={styles.picker}
                                        onValueChange={(itemValue) => {
                                            setCourse(itemValue);
                                            clearError('course');
                                        }}
                                        dropdownIconColor="#0066FF"
                                    >
                                        {courseOptions.map((option: any, index: number) => (
                                            <Picker.Item key={option._id || `course-${index}`} label={option.name || 'Curso'} value={option._id || ''} />
                                        ))}
                                    </Picker>
                                </View>
                                {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}
                            </View>
                        )}

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TamaguiButton
                                neonEffect={true}
                                icon="cancel"
                                variantColor="gray"
                                title="Cancelar"
                                buttonType="iconTop"
                                iconSize={28}
                                style={styles.button}
                                onPress={handleCancel}
                            />
                            <TamaguiButton
                                neonEffect={true}
                                icon="person-add"
                                variantColor="blue"
                                title="Generar"
                                buttonType="iconTop"
                                iconSize={28}
                                style={styles.button}
                                onPress={handlePreview}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Preview Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={previewModalVisible}
                    onRequestClose={() => setPreviewModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <MaterialCommunityIcons name="clipboard-check" size={40} color="#0066FF" />
                                <Text style={styles.modalTitle}>Confirmar Registro</Text>
                            </View>

                            <View style={styles.previewContent}>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Nombre:</Text>
                                    <Text style={styles.previewValue}>{fullName}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Usuario:</Text>
                                    <Text style={styles.previewValue}>{username}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Contraseña:</Text>
                                    <Text style={styles.previewValue}>••••••••</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Tipo Doc:</Text>
                                    <Text style={styles.previewValue}>{getTypeDocumentLabel()}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Documento:</Text>
                                    <Text style={styles.previewValue}>{documentNumber}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Email:</Text>
                                    <Text style={styles.previewValue}>{email}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Rol:</Text>
                                    <Text style={styles.previewValue}>{getRoleName()}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Institución:</Text>
                                    <Text style={styles.previewValue}>{getHightSchoolLabel()}</Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Curso:</Text>
                                    <Text style={styles.previewValue}>{getCourseLabel()}</Text>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TamaguiButton
                                    neonEffect={true}
                                    icon="cancel"
                                    variantColor="gray"
                                    title="Cancelar"
                                    style={styles.modalButton}
                                    onPress={() => setPreviewModalVisible(false)}
                                />
                                <TamaguiButton
                                    neonEffect={true}
                                    icon="check"
                                    variantColor="green"
                                    title="Confirmar"
                                    style={styles.modalButton}
                                    onPress={handleConfirm}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Result Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={resultModalVisible}
                    onRequestClose={handleResultModalClose}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <View style={styles.resultIconContainer}>
                                {resultType === 'success' ? (
                                    <MaterialCommunityIcons name="check-circle" size={80} color="#00CC00" />
                                ) : (
                                    <MaterialIcons name="error" size={80} color="#FF0000" />
                                )}
                            </View>
                            <Text style={[styles.modalTitle, resultType === 'success' ? styles.successText : styles.resultErrorText]}>
                                {resultType === 'success' ? '¡Éxito!' : 'Error'}
                            </Text>
                            <Text style={styles.resultMessage}>{resultMessage}</Text>
                            <TamaguiButton
                                neonEffect={true}
                                icon="check"
                                variantColor={resultType === 'success' ? 'blue' : 'red'}
                                title="Aceptar"
                                style={styles.acceptButton}
                                onPress={handleResultModalClose}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerGradient: {
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0066FF',
        height: 50,
    },
    inputError: {
        borderColor: '#FF0000',
    },
    inputIcon: {
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 8,
        color: '#333',
        fontSize: 16,
    },
    picker: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    previewContent: {
        width: '100%',
        marginBottom: 20,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    previewLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    previewValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    resultIconContainer: {
        marginBottom: 15,
    },
    successText: {
        color: '#00CC00',
    },
    resultErrorText: {
        color: '#FF0000',
    },
    resultMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    acceptButton: {
        width: '100%',
    },
});

export default RegisterForm;