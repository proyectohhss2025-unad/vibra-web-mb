import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from '@/shared/services/api/api';

// ─── Tipos ───

export interface Participant {
  _id: string;
  userId: string;
  nickname: string;
  avatar?: string;
  points: number;
  level: 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante';
  currentStreak: number;
  maxStreak: number;
  totalActivitiesCompleted: number;
  lastActivityDate?: string;
  lastSessionDate?: string;
  currentCourse?: string;
  preferences?: {
    language: string;
    notifications: boolean;
  };
  isActive: boolean;
}

export interface UpdatePointsResponse {
  points: number;
  level: string;
  currentStreak: number;
  maxStreak: number;
  totalActivitiesCompleted: number;
  lastActivityDate?: string;
}

// ─── Tipos del Context ───

interface ParticipantContextType {
  participant: Participant | null;
  isLoading: boolean;
  error: string | null;
  refreshParticipant: () => Promise<void>;
  updateAfterActivity: (pointsGained: number) => Promise<UpdatePointsResponse>;
  updateProfile: (data: Partial<Participant>) => Promise<void>;
  setParticipantFromLogin: (participant: Participant) => Promise<void>;
  clearParticipant: () => Promise<void>;
}

// ─── Storage helpers ───

const PARTICIPANT_STORAGE_KEY = 'participant';

async function saveParticipantToStorage(participant: Participant): Promise<void> {
  const json = JSON.stringify(participant);
  if (Platform.OS === 'web') {
    localStorage.setItem(PARTICIPANT_STORAGE_KEY, json);
  } else {
    await AsyncStorage.setItem(PARTICIPANT_STORAGE_KEY, json);
  }
}

async function loadParticipantFromStorage(): Promise<Participant | null> {
  try {
    let json: string | null = null;
    if (Platform.OS === 'web') {
      json = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
    } else {
      json = await AsyncStorage.getItem(PARTICIPANT_STORAGE_KEY);
    }
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

async function removeParticipantFromStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
  } else {
    await AsyncStorage.removeItem(PARTICIPANT_STORAGE_KEY);
  }
}

// ─── Context ───

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

// ─── Provider ───

export const ParticipantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar desde storage al montar
  useEffect(() => {
    (async () => {
      const stored = await loadParticipantFromStorage();
      if (stored) {
        setParticipant(stored);
      }
      setIsLoading(false);
    })();
  }, []);

  // ─── Refrescar desde API ───
  const refreshParticipant = useCallback(async () => {
    try {
      // Obtener userId del storage
      let userId: string | null = null;
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await AsyncStorage.getItem('userId');
      }

      if (!userId) {
        console.warn('[ParticipantContext] No userId found in storage');
        return;
      }

      const response = await api.get<Participant>(`/api/participants/by-user/${userId}`);
      const data = response.data ?? response;

      setParticipant(data);
      await saveParticipantToStorage(data);
      setError(null);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message;

      if (status === 404) {
        // Participante no existe — lanzar para que el caller lo cree
        console.warn('[ParticipantContext] Participant not found for user');
        throw err;
      }

      // Error de red o del servidor — solo loguear, no interrumpir
      console.warn('[ParticipantContext] Could not refresh participant:', msg);
      setError(null); // No mostrar error al usuario por fallo de red
    }
  }, []);

  // ─── Actualizar después de completar actividad ───
  const updateAfterActivity = useCallback(async (pointsGained: number): Promise<UpdatePointsResponse> => {
    if (!participant?._id) {
      throw new Error('No hay participante activo');
    }

    const response = await api.patch<UpdatePointsResponse>(
      `/api/participants/${participant._id}/points`,
      { pointsIncrement: pointsGained, activityCompleted: true },
    );

    const result = response.data ?? response;

    // Actualizar contexto local
    setParticipant(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        points: result.points,
        level: result.level as Participant['level'],
        currentStreak: result.currentStreak,
        maxStreak: result.maxStreak,
        totalActivitiesCompleted: result.totalActivitiesCompleted,
        lastActivityDate: result.lastActivityDate,
      };
      saveParticipantToStorage(updated);
      return updated;
    });

    return result;
  }, [participant?._id]);

  // ─── Actualizar perfil ───
  const updateProfile = useCallback(async (data: Partial<Participant>) => {
    if (!participant?._id) {
      throw new Error('No hay participante activo');
    }

    const response = await api.post('/api/participants/update', {
      _id: participant._id,
      ...data,
    });

    const updated = response.data ?? response;
    setParticipant(updated);
    await saveParticipantToStorage(updated);
  }, [participant?._id]);

  // ─── Setear desde login ───
  const setParticipantFromLogin = useCallback(async (p: Participant) => {
    setParticipant(p);
    await saveParticipantToStorage(p);
    setError(null);
  }, []);

  // ─── Limpiar al cerrar sesión ───
  const clearParticipant = useCallback(async () => {
    setParticipant(null);
    await removeParticipantFromStorage();
  }, []);

  const value = useMemo<ParticipantContextType>(
    () => ({
      participant,
      isLoading,
      error,
      refreshParticipant,
      updateAfterActivity,
      updateProfile,
      setParticipantFromLogin,
      clearParticipant,
    }),
    [participant, isLoading, error, refreshParticipant, updateAfterActivity, updateProfile, setParticipantFromLogin, clearParticipant],
  );

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};

// ─── Hook ───

const useParticipant = (): ParticipantContextType => {
  const context = useContext(ParticipantContext);
  if (context === undefined) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

export default useParticipant;
