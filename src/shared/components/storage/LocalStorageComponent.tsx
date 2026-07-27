import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    key: string;
    defaultValue?: string;
    label?: string;
}

const LocalStorageComponent: React.FC<Props> = ({ key, defaultValue = '', label = key }) => {
    const [value, setValue] = useState<string>(defaultValue);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadValue = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(key);
                if (storedValue !== null) {
                    setValue(storedValue);
                } else {
                    // Si no hay valor almacenado, guarda el defaultValue
                    await AsyncStorage.setItem(key, defaultValue);
                    setValue(defaultValue);
                }
            } catch (error) {
                console.error('Error loading value from AsyncStorage:', error);
                // Manejar el error según sea necesario (mostrar un mensaje al usuario, etc.)
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key, defaultValue]);

    const saveValue = async (newValue: string) => {
        try {
            await AsyncStorage.setItem(key, newValue);
            setValue(newValue);
        } catch (error) {
            console.error('Error saving value to AsyncStorage:', error);
            // Manejar el error según sea necesario
        }
    };

    const clearValue = async () => {
        try {
            await AsyncStorage.removeItem(key);
            setValue(defaultValue); // Reinicia al valor por defecto
        } catch (error) {
            console.error('Error clearing value from AsyncStorage:', error);
        }
    };

    if (loading) {
        return <Text>Cargando...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={saveValue}
                placeholder={`Ingrese el valor para ${label}`}
            />
            <Button title="Borrar" onPress={clearValue} />
            <Text>Valor almacenado: {value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: 'white'
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
    },
});

export default LocalStorageComponent;