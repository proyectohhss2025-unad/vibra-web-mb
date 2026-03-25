import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '@/shared/services/api/auth';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>();

    const router = useRouter();

    const actionLogin = async (email: string, password: string) => {
        console.log('email in actionLogin: ', email);
        console.log('password in actionLogin: ', password);

        try {
            const user = await AuthService.login(email, password);
            console.log('user in actionLogin: ', user);
            setUser(user);
            setIsAuthenticated(true);
            // Alert.alert('Éxito', 'Inicio de sesión exitoso.');
            //const token = response.data?.access_token;
            //await SecureStore.setItemAsync('authToken', token);
            return user;
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