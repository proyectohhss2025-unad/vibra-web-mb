/**
 * @fileoverview Contexto global de escala de fuente (accesibilidad).
 * Escala la tipografía de toda la aplicación:
 *  - Native: usa PixelRatio.setFontScale (escala todos los Text nativos).
 *  - Web: cambia el font-size del elemento raíz (documentElement), como en vibra-web.
 * La preferencia se persiste en AsyncStorage (native) / localStorage (web).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, PixelRatio } from 'react-native';

const FONT_SCALE_KEY = 'fontScale';
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;

interface FontScaleContextType {
  fontScale: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(
  undefined,
);

// ─── Persistencia ───

async function readStoredScale(): Promise<number> {
  try {
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem(FONT_SCALE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed)) return parsed;
      }
      return 1;
    }
    const saved = await AsyncStorage.getItem(FONT_SCALE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 1;
  } catch {
    return 1;
  }
}

async function writeStoredScale(scale: number): Promise<void> {
  try {
    const value = String(scale);
    if (Platform.OS === 'web') {
      localStorage.setItem(FONT_SCALE_KEY, value);
    } else {
      await AsyncStorage.setItem(FONT_SCALE_KEY, value);
    }
  } catch {
    // ignorar errores de storage
  }
}

async function removeStoredScale(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(FONT_SCALE_KEY);
    } else {
      await AsyncStorage.removeItem(FONT_SCALE_KEY);
    }
  } catch {
    // ignorar errores de storage
  }
}

// ─── Aplicar escala al sistema ───

function applyFontScale(scale: number): void {
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  if (Platform.OS === 'web') {
    // react-native-web: PixelRatio.setFontScale es no-op, usamos el root como en vibra-web
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${clamped * 100}%`;
    }
    return;
  }
  // Native: escala todos los Text nativos de la app
  try {
    (PixelRatio as any).setFontScale?.(clamped);
  } catch {
    // si setFontScale no está disponible, no hacer nada
  }
}

// ─── Provider ───

export const FontScaleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fontScale, setFontScale] = useState(1);

  // Restaurar preferencia guardada al montar
  useEffect(() => {
    let mounted = true;
    readStoredScale().then((saved) => {
      if (!mounted) return;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, saved));
      setFontScale(clamped);
      applyFontScale(clamped);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Aplicar escala cuando cambia
  useEffect(() => {
    applyFontScale(fontScale);
  }, [fontScale]);

  const increase = useCallback(() => {
    setFontScale((prev) => {
      const next = Math.min(MAX_SCALE, prev + STEP);
      writeStoredScale(next);
      return next;
    });
  }, []);

  const decrease = useCallback(() => {
    setFontScale((prev) => {
      const next = Math.max(MIN_SCALE, prev - STEP);
      writeStoredScale(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFontScale(1);
    removeStoredScale();
  }, []);

  const value = useMemo<FontScaleContextType>(
    () => ({ fontScale, increase, decrease, reset }),
    [fontScale, increase, decrease, reset],
  );

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
};

// ─── Hook ───

const useFontScale = (): FontScaleContextType => {
  const context = useContext(FontScaleContext);
  if (context === undefined) {
    throw new Error('useFontScale must be used within a FontScaleProvider');
  }
  return context;
};

export default useFontScale;
