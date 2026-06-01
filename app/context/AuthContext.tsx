/**
 * @fileoverview AuthContext global — provee estado de autenticación, login y logout unificado
 * Reemplaza el hook useAuth.ts como fuente única de verdad para la sesión.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AuthService from '@/shared/services/api/auth';
import { TestsApi } from '@/shared/services/api/api';
import useParticipant from './ParticipantContext';
import useUser from './UserContext';

// ─── Tipos ───

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// ─── Helpers de storage ───

const TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const PARTICIPANT_KEY = 'participant';

async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function saveUserId(userId: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_ID_KEY, userId);
  } else {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }
}

async function readToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function removeAuthData(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(PARTICIPANT_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_ID_KEY);
      await AsyncStorage.removeItem(PARTICIPANT_KEY);
    }
  } catch {
    // ignorar errores de storage en cleanup
  }
}

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ─── Context ───

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);

  // Contextos hijos para reset en logout
  const { clearParticipant } = useParticipant();
  const { setUser: setUserContext } = useUser();

  // ─── Login ───
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await AuthService.login(username, password);
      const token = response.access_token;
      const decodedToken = decodeJwt(token);
      const userId = decodedToken?.sub || decodedToken?.userId || decodedToken?._id;

      setUser(response);
      setIsAuthenticated(true);

      if (token) await saveToken(token);
      if (userId) await saveUserId(userId);

      // ── Flujo inicial: verificar tests pendientes tipo "initial" ──
      if (userId) {
        try {
          const pending = await TestsApi.getPendingByType('initial', userId);
          if (pending.total > 0) {
            // Redirigir a pantalla de tests iniciales
            router.replace(`/features/test-prompt?type=initial&userId=${userId}`);
            return response;
          }
        } catch {
          // Si falla la consulta, continuar con el flujo normal
        }
      }

      return response;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // ─── Check Auth ───
  const checkAuth = useCallback(async () => {
    const token = await readToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
    return !!token;
  }, []);

  // ─── Ruteo inicial: verificar sesión al montar ───
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    checkAuth().then((authenticated) => {
      if (authenticated) {
        router.replace('/features/(tabs)/one');
      }
    });
  }, [checkAuth]);

  // ─── Logout unificado ───
  const logout = useCallback(async () => {
    // 0. Obtener userId antes de limpiar
    let userId: string | null = null;
    try {
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await AsyncStorage.getItem('userId');
      }
    } catch {
      // ignorar
    }

    // ── Flujo final: verificar tests pendientes tipo "final" ──
    if (userId) {
      try {
        const pending = await TestsApi.getPendingByType('final', userId);
        if (pending.total > 0) {
          // Redirigir a pantalla de tests finales antes del logout
          router.replace(`/features/test-prompt?type=final&userId=${userId}`);
          return; // No continuar con el logout todavía
        }
      } catch {
        // Si falla la consulta, continuar con el logout normal
      }
    }

    // 1. Limpiar storage (token, userId, participant)
    await removeAuthData();

    // 2. Resetear estados locales
    setUser(undefined);
    setIsAuthenticated(false);

    // 3. Resetear contextos de usuario y participante
    setUserContext({});
    await clearParticipant();

    // 4. Redirigir al login
    router.replace('/');
  }, [clearParticipant, setUserContext]);

  // ─── Valor del context ───
  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated, isLoading, login, logout, checkAuth }),
    [user, isAuthenticated, isLoading, login, logout, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ───

const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default useAuthContext;
