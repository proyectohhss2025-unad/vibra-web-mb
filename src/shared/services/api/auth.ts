/**
 * @fileoverview Servicios de autenticación para la aplicación
 * @module services/api/auth
 */
import { Alert } from 'react-native';
import api from './api';

/**
 * Interfaz para los datos del formulario de recuperación de contraseña
 * @interface EmailFormData
 * @property {string} to - Correo electrónico del destinatario
 * @property {string} subject - Asunto del correo
 * @property {string} message - Mensaje del correo
 */
export interface EmailFormData {
    to: string;
    subject: string;
    message: string;
}

/**
 * Servicio para manejar la autenticación y operaciones relacionadas
 * @namespace AuthService
 */
const AuthService = {
    /**
     * Realiza el inicio de sesión del usuario
     * @function
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<any>} - Promesa que resuelve con los datos del usuario
     * @throws {Error} - Error si las credenciales son incorrectas o hay un problema de conexión
     */
    login: async (username: string, password: string): Promise<any> => {
        if (!username || !password) {
            throw new Error('Por favor, completa todos los campos.');
        }

        try {
            const response = await api.post('/api/auth/login', {
                username,
                password,
            });

            if (response?.data?.access_token) {
                return response.data;
            }

            throw new Error('Credenciales incorrectas o error en la conexión.');
        } catch (error: any) {
            // Propagar el mensaje del servidor cuando exista (ej: cuenta pendiente
            // de aprobación) para dar contexto claro al usuario.
            const serverMsg = error?.response?.data?.message;
            if (typeof serverMsg === 'string' && serverMsg) {
                throw new Error(serverMsg);
            }
            throw new Error('Credenciales incorrectas o error en la conexión.');
        }
    },

    /**
     * Envía una solicitud para recuperar la contraseña
     * @function
     * @param {EmailFormData} formData - Datos del formulario de recuperación
     * @returns {Promise<any>} - Promesa que resuelve con la respuesta del servidor
     * @throws {Error} - Error si hay un problema de conexión
     */
    recoverPassword: async (formData: EmailFormData): Promise<any> => {
        try {
            const response = await api.post('/email/send-email-recovery-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: formData.to,
                    html: `<p>Nueva contraseña: ${formData.message}</p>`,
                }),
            });

            return response;
        } catch (error) {
            throw new Error('Error de conexión');
        }
    }
};

export default AuthService;