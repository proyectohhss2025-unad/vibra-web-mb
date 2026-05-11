import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '@/shared/services/api/auth';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>();

    const router = useRouter();

    const saveToken = async (token: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('authToken', token);
        } else {
            await SecureStore.setItemAsync('authToken', token);
        }
    };

    const saveUserId = async (userId: string) => {
        console.log('Saving userId:', userId);
        if (Platform.OS === 'web') {
            localStorage.setItem('userId', userId);
        } else {
            await AsyncStorage.setItem('userId', userId);
        }
    };

    const decodeJwt = (token: string): any => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    const actionLogin = async (username: string, password: string) => {
        console.log('username in actionLogin: ', username);
        console.log('password in actionLogin: ', password);

        try {
            const response = await AuthService.login(username, password);
            console.log('response in actionLogin: ', response);
            const token = response.access_token;
            const decodedToken = decodeJwt(token);
            const userId = decodedToken?.sub || decodedToken?.userId || decodedToken?._id;
            console.log('Decoded token payload:', decodedToken);
            console.log('Extracted userId from decoded token:', userId);
            setUser(response);
            setIsAuthenticated(true);
            if (token) {
                await saveToken(token);
            }
            if (userId) {
                console.log('Calling saveUserId with:', userId);
                await saveUserId(userId);
            } else {
                console.log('No userId found in decoded token');
            }
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        }
    };

    const checkAuth = async () => {
        const token = '';//await SecureStore.getItemAsync('authToken');
        setIsAuthenticated(!!token);
        return !!token;
    };

    const logout = async () => {
        //await SecureStore.deleteItemAsync('authToken');
        setIsAuthenticated(false);
        router.push('/');
    };

    return { isAuthenticated, login: actionLogin, checkAuth, logout, user };
};


export default useAuth;