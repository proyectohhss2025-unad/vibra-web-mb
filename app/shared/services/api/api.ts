/**
 * @fileoverview Axios instance configuration for API communication
 * @module services/api
 */
import ActivityResponse, { PaginatedResponse } from '@/shared/types/api';
import axios from 'axios';
import { Platform } from 'react-native';
import config from '../../../../config/env.json';

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


// Interceptor para JWT
/**
 * Interceptor for adding JWT token to request headers
 * @function
 * @param {Object} config - Axios request configuration
 * @returns {Promise<Object>} - Modified request configuration
 */
/* api.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});*/

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
    getEmotionsList: () => api.get<string[]>('/api/activities/emotions/list')
};

export default api;