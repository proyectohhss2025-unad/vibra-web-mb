/**
 * @fileoverview Axios instance configuration for API communication
 * @module services/api
 */
import ActivityResponse, { PaginatedResponse } from '@/shared/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import config from '../../../../config/env.json';
import eventBus from '@/shared/utils/event-bus';

/**
 * Base URL for the API obtained from environment configuration
 * @constant {string}
 */
const apiBaseUrl = config.development.apiBaseUrl;

/**
 * Preconfigured Axios instance for making HTTP requests
 * @constant {import('axios').AxiosInstance}
 * @default
 * @property {string} baseURL - The base URL for all requests
 * @property {number} timeout - Request timeout in milliseconds
 * @property {Object} headers - Default headers for all requests
 */
const api = axios.create({
    baseURL: `${apiBaseUrl}`,
    timeout: 10000,
    headers: {
        //common: { "Authorization": 'Bearer ' },
        //post: { 'Content-Type': 'application/json' }
    }
});

const API_BASE_URL = Platform.select({
    ios: 'http://localhost:3000/api',
    android: 'http://10.0.2.2:3000/api',
    web: process.env.API_URL
});

/**
 * Obtiene el token JWT almacenado según la plataforma
 * - Web: localStorage
 * - Mobile: SecureStore (expo-secure-store)
 * @returns {Promise<string | null>}
 */
const getToken = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'web') {
            return localStorage.getItem('authToken');
        }
        return await SecureStore.getItemAsync('authToken');
    } catch {
        return null;
    }
};

// Interceptor para JWT
/**
 * Interceptor for adding JWT token to request headers
 * @function
 * @param {Object} config - Axios request configuration
 * @returns {Promise<Object>} - Modified request configuration
 */
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta: manejar 401 (token expirado/inválido) y errores de red
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Detectar errores de conexión (sin respuesta del servidor)
        if (!error?.response) {
            const isNetworkError =
                error?.code === 'ERR_NETWORK' ||
                error?.code === 'ECONNABORTED' ||
                error?.message?.includes?.('Network Error') ||
                error?.message?.includes?.('timeout') ||
                error?.message?.includes?.('socket hang up');

            if (isNetworkError) {
                eventBus.emit('network_error');
            }
            return Promise.reject(error);
        }

        if (error?.response?.status === 401) {
            const url = error.config?.url || '';
            const isPublicRoute = url.includes('/api/auth/login') || url.includes('/api/auth/register');
            if (!isPublicRoute) {
                // Limpiar token y redirigir al login
                try {
                    if (Platform.OS === 'web') {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userId');
                        window.location.href = '/';
                    } else {
                        await SecureStore.deleteItemAsync('authToken');
                        await AsyncStorage.removeItem('userId');
                        router.replace('/');
                    }
                } catch {
                    // ignorar errores de storage
                }
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Service for handling activities
 * @namespace ActivityService
 */
export const ActivityService = {
    getActivityById: (activityId: string) =>
        api.get<ActivityResponse>(`/api/activities/${activityId}`),
    /**
     * Retrieves the current daily activity
     * @function
     * @returns {Promise<ActivityResponse>} - Promise that resolves to the current daily activity
     */
    getDailyActivity: (): Promise<ActivityResponse> =>
        api.get<ActivityResponse>('/api/activities/daily/current').then(res => res.data),
    submitResponse: (activityId: string, userId: string, data: any) =>
        api.post(`/api/activities/${activityId}/${userId}/submit`, {
            params: { id: activityId, userId },
            answers: [...data]
        }),
    getActivityHistory: (page = 1, userId = '') =>
        api.get<PaginatedResponse<Activity>>('/api/activities', {
            params: { page, limit: 10, userId, emotion: 'all' }
        }).then(res => res.data),
    getEmotionsList: () => api.get<string[]>('/api/activities/emotions/list'),
    /**
     * Retrieves all emotions from the emotions catalog
     * @function
     * @returns {Promise<{data: Array<{_id: string, id: string, name: string, category?: string, icono?: string}>, total: number}>}
     */
    getEmotions: (page = 1, limit = 50) =>
        api.get<{ data: any[]; total: number }>('/api/emotions', {
            params: { page, limit }
        }).then(res => res.data),
    /**
     * Retrieves challenges (group activities) for a user
     * @function
     * @param {string} userId - The user ID
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 10)
     * @returns {Promise<any>} - Promise that resolves to paginated challenges
     */
    getChallenges: (userId: string, page = 1, limit = 10) =>
        api.get<any>(`/api/activities/user/${userId}`, {
            params: { page, limit }
        }).then(res => res.data),
    /**
     * Registra el Expo Push Token del dispositivo en el backend
     * @function
     * @param {string} token - Expo Push Token
     * @param {string} platform - Plataforma ('ios' | 'android' | 'web')
     * @returns {Promise<{success: boolean, message: string}>}
     */
    registerPushToken: (token: string, platform: string) =>
        api.post('/api/push-notifications/register', { token, platform })
            .then(res => res.data),
    /**
     * Registra la completación de una actividad diaria
     * @function
     * @param {Object} data - Datos de completación
     * @param {string} data.participant - ID del participante
     * @param {string} data.activity - ID de la actividad
     * @param {number} data.plannedScore - Puntaje máximo posible
     * @param {number} data.achievedScore - Puntaje alcanzado
     * @param {number} [data.timeSpent] - Tiempo total en segundos
     * @param {Array} [data.gamesCompleted] - Detalle por juego
     * @returns {Promise<any>}
     */
    createCompletion: (data: {
        participant: string;
        activity: string;
        plannedScore: number;
        achievedScore: number;
        timeSpent?: number;
        gamesCompleted?: Array<{ type: string; score: number; maxScore: number }>;
    }) => api.post('/api/activity-completions', data).then(res => res.data),
};

/**
 * Service for handling rankings
 * @namespace RankingApi
 */
export const RankingApi = {
    /**
     * Obtiene el ranking general de todos los participantes
     * @param {number} [limit=20] - Máximo de resultados
     * @param {number} [offset=0] - Paginación
     */
    getGeneral: (limit = 20, offset = 0) =>
        api.get<any>(`/api/rankings/general?limit=${limit}&offset=${offset}`)
            .then(res => res.data),

    /**
     * Obtiene el ranking filtrado por curso
     * @param {string} courseId - ID del curso
     * @param {number} [limit=20] - Máximo de resultados
     * @param {number} [offset=0] - Paginación
     */
    getByCourse: (courseId: string, limit = 20, offset = 0) =>
        api.get<any>(`/api/rankings/course/${courseId}?limit=${limit}&offset=${offset}`)
            .then(res => res.data),

    /**
     * Obtiene el ranking filtrado por institución
     * @param {string} institutionId - ID de la institución
     * @param {number} [limit=20] - Máximo de resultados
     * @param {number} [offset=0] - Paginación
     */
    getByInstitution: (institutionId: string, limit = 20, offset = 0) =>
        api.get<any>(`/api/rankings/institution/${institutionId}?limit=${limit}&offset=${offset}`)
            .then(res => res.data),
};

/**
 * Service for handling tests (initial/final)
 * @namespace TestsApi
 */
export const TestsApi = {
    /**
     * Obtiene tests pendientes por tipo (initial/final) para un usuario
     * @param {'initial' | 'final'} type - Tipo de test
     * @param {string} userId - ID del usuario
     */
    getPendingByType: (type: 'initial' | 'final', userId: string) =>
        api.get<{ data: any[]; total: number }>('/api/tests/pending-by-type', {
            params: { type, userId }
        }).then(res => res.data),
};

export default api;