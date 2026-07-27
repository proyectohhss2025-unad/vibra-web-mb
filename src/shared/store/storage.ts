import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const IS_IOS = Platform.OS === 'ios';

const storage = {
    // Almacenamiento seguro para datos sensibles (JWT)
    async setToken(value: string): Promise<void> {
        return SecureStore.setItemAsync('auth_token', value);
    },

    async getToken(): Promise<string | null> {
        return SecureStore.getItemAsync('auth_token');
    },

    async removeToken(): Promise<void> {
        return SecureStore.deleteItemAsync('auth_token');
    },

    // Almacenamiento general para datos no sensibles
    async setItem(key: string, value: any): Promise<void> {
        const jsonValue = JSON.stringify(value);
        return AsyncStorage.setItem(`app_${key}`, jsonValue);
    },

    async getItem<T>(key: string): Promise<T | null> {
        const jsonValue = await AsyncStorage.getItem(`app_${key}`);
        return jsonValue ? JSON.parse(jsonValue) : null;
    },

    async removeItem(key: string): Promise<void> {
        return AsyncStorage.removeItem(`app_${key}`);
    },

    // Limpiar el almacenamiento
    async clear(): Promise<void> {
        await SecureStore.deleteItemAsync('auth_token');
        await AsyncStorage.clear();
    },

    // Métodos específicos para React Query
    async getQueryCache(): Promise<any> {
        return this.getItem('queryCache');
    },

    async setQueryCache(value: any): Promise<void> {
        return this.setItem('queryCache', value);
    }
};

export default storage;