import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTailwind } from 'tailwind-rn';
import api from '../../shared/services/api/api';
import CustomButton from '@/shared/components/ui/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RegisterForm = () => {
    const tailwind = useTailwind();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [typeDocument, setTypeDocument] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [hightSchool, setHightSchool] = useState('0');
    const [course, setCourse] = useState('');
    const [typeDocumentOptions, setTypeDocumentOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState<any>([]);
    const [hightSchoolOptions, setHightSchoolOptions] = useState<any>([]);
    const [courseOptions, setCourseOptions] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [isValidateForm, setIsValidateForm] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (username && password && documentNumber && typeDocument && email && role && course) {
            setIsValidateForm(true);
        }
    }, [username, password, documentNumber, typeDocument, email, role, course]);

    useEffect(() => {
        const fetchOptions_ = async () => {
            if (hightSchool != '0') {
                const hightSchoolResponse: any = await api.get(`/courses/allByHightSchool/${hightSchool}`);
                setCourseOptions([{ _id: '0', name: 'Seleccione un curso' }, ...hightSchoolResponse.data]);
            }
        }
        fetchOptions_();
    }, [hightSchool]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const typeDocumentResponse: any = {
                    data: [
                        { value: '0', label: 'Seleccione un tipo' },
                        { value: '1', label: 'Documento de identidad' },
                        { value: '2', label: 'Registro civil' },
                        { value: '3', label: 'Cedula de ciudadania' }
                    ]
                };
                const roleResponse: any = await api.get(`/roles/all`);
                const hightSchoolResponse: any = await api.get(`/hightSchools/all`);
                console.log('roleResponse?.data:', roleResponse?.data);
                setTypeDocumentOptions(typeDocumentResponse?.data);
                setRoleOptions([{ _id: '0', name: 'Seleccione un tipo' }, ...roleResponse.data]);
                setHightSchoolOptions([{ _id: '0', name: 'Seleccione una institución' }, ...hightSchoolResponse.data]);
            } catch (error) {
                console.error('Error fetching options', error);
            }
        };

        fetchOptions();
    }, []);

    const handleCancel = async () => {
        router.push('/');
    }

    const handleRegister = async () => {
        if (!username || !password || !documentNumber || !typeDocument || !email || !role || !course) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);
        const uniqueID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        try {
            const response = await api.post('/users/create', { id: uniqueID, username, password, documentNumber, typeDocument, email, role, course, hightSchool, avatar: '04.jpg' });
            if (response) {
                Alert.alert('Éxito', 'Registro de usuario exitoso.');
                console.log('Respuesta de la API:', response.data);
                router.push('/');
            }
        } catch (error) {
            Alert.alert('Error', 'Campos incompletos');
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} >
                <ScrollView style={styles.scrollView}>
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#0066FF', '#00CCFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerGradient}
                        >
                            <MaterialIcons name="person-add" size={36} color="white" style={styles.headerIcon} />
                            <Text style={styles.headerTitle}>Registro de usuario</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Nombre de usuario
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="person" size={22} color="#0066FF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Contraseña
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="lock" size={22} color="#0066FF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Tipo de documento
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="description" size={22} color="#0066FF" style={styles.inputIcon} />
                            <Picker
                                selectedValue={typeDocument}
                                style={styles.picker}
                                onValueChange={(itemValue) => setTypeDocument(itemValue)}
                                dropdownIconColor="#0066FF"
                            >
                                {typeDocumentOptions.map((option: any) => (
                                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Documento
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="credit-card" size={22} color="#0066FF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Número de documento"
                                value={documentNumber}
                                onChangeText={setDocumentNumber}
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Correo electrónico
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="email" size={22} color="#0066FF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="email@host.com"
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Rol de usuario
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="assignment-ind" size={22} color="#0066FF" style={styles.inputIcon} />
                            <Picker
                                selectedValue={role}
                                style={styles.picker}
                                onValueChange={(itemValue) => setRole(itemValue)}
                                dropdownIconColor="#0066FF"
                            >
                                {roleOptions?.map((option: any) => (
                                    <Picker.Item key={option._id} label={option.name} value={option._id} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Institución educativa
                        </Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="school" size={22} color="#0066FF" style={styles.inputIcon} />
                            <Picker
                                selectedValue={hightSchool}
                                style={styles.picker}
                                onValueChange={(itemValue: any) => {
                                    console.log('itemValue: ', itemValue);
                                    setHightSchool(itemValue);
                                }}
                                mode="dropdown"
                                dropdownIconColor="#0066FF"
                            >
                                {hightSchoolOptions.map((option: any) => (
                                    <Picker.Item key={option._id} label={option.name} value={option._id} />
                                ))}
                            </Picker>
                            {hightSchool !== '0' &&
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>
                                        Curso
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialIcons name="class" size={22} color="#0066FF" style={styles.inputIcon} />
                                        <Picker
                                            selectedValue={course}
                                            style={styles.picker}
                                            onValueChange={(itemValue) => setCourse(itemValue)}
                                            dropdownIconColor="#0066FF"
                                        >
                                            {courseOptions.map((option: any) => (
                                                <Picker.Item key={option._id} label={option.name} value={option._id} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            }
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <CustomButton
                            neonEffect={true}
                            icon="cancel"
                            variantColor='gray'
                            title={loading ? 'Cargando...' : 'Cancelar'}
                            disabled={loading}
                            buttonType='iconTop'
                            iconSize={32}
                            style={[{ flex: 1 }, tailwind("text-xl text-white")]}
                            onPress={handleCancel}
                        />
                        <CustomButton
                            neonEffect={true}
                            icon="person-add"
                            variantColor='blue'
                            title={loading ? 'Cargando...' : 'Generar usuario'}
                            disabled={loading}
                            buttonType='iconTop'
                            iconSize={32}
                            style={[{ flex: 1 }, tailwind("text-xl text-white")]}
                            onPress={handleRegister}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 4,
    },
    scrollView: {
        padding: 20,
    },
    headerContainer: {
        marginBottom: 24,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 15,
    },
    headerIcon: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
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
        overflow: 'hidden',
        height: 50,
    },
    inputIcon: {
        paddingHorizontal: 10,
    },
    textInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 8,
        color: '#333',
    },
    picker: {
        flex: 1,
        height: 50,
        color: '#333',
        width: '80%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 16,
    },
});

export default RegisterForm;