/**
 * TestListScreen — Orquestador de tests obligatorios
 *
 * - Si NO hay tests pendientes → redirige automáticamente al home.
 * - Si HAY tests pendientes → muestra la lista para que el usuario los complete.
 * - El botón "Continuar" solo se habilita cuando TODOS están realizados.
 * - Los tests completados se muestran como "Realizado" (no clickeables).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@shared/services/api/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
import TamaguiButton from "@shared/components/ui/tamagui/TamaguiButton";
import { showTamaguiAlert } from '@shared/components/ui/tamagui';
import { getSafeKeyObjectFromStorage } from '@shared/utils/safe-token-storage';

type TestStatusItem = {
  testId: string;
  title: string;
  description: string;
  completed: boolean;
  score?: number;
};

type StatusResponse = {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  allCompleted: boolean;
  tests: TestStatusItem[];
};

/**
 * Obtiene el userId desde storage (mismo patrón que TestModalScreen)
 */
const getUserId = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return getSafeKeyObjectFromStorage('userId');
  }
  return await AsyncStorage.getItem('userId');
};

const TestListScreen = () => {
  const tailwind = useTailwind();
  const router = useRouter();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refrescar al ganar foco (vuelve de TestModalScreen)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  // Redirección diferida para evitar conflictos de navegación
  const [shouldRedirect, setShouldRedirect] = useState(false);
  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/features/(tabs)/one');
    }
  }, [shouldRedirect]);

  // Carga de datos: usa userId desde storage
  useEffect(() => {
    let active = true;

    const load = async () => {
      const userId = await getUserId();
      if (!active) return;

      if (!userId) {
        // Aún no hay userId disponible, esperar al próximo refresh
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const res = await api.get<StatusResponse>(`/api/pretests/status/${userId}?type=initial`);
        if (!active) return;

        if (res.data.allCompleted || res.data.totalTests === 0) {
          setShouldRedirect(true);
          return;
        }

        setStatus(res.data);
      } catch (err: any) {
        if (active) {
          console.error('[TestListScreen] Error:', err.message);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [refreshKey]);

  const handleStartTest = (testId: string) => {
    router.push({
      pathname: "/features/test/TestModalScreen",
      params: { testId },
    });
  };

  const handleContinue = () => {
    router.push("/features/(tabs)/one");
  };

  // Estado: cargando
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={{ color: '#666', fontSize: 14, marginTop: 12 }}>Cargando tests...</Text>
      </View>
    );
  }

  // Estado: error
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#666', fontSize: 16, marginBottom: 16, textAlign: 'center', paddingHorizontal: 20 }}>
          No se pudieron cargar los tests.
        </Text>
        <TamaguiButton
          title="Reintentar"
          variantColor="blue"
          onPress={async () => {
            setLoading(true);
            setError(false);
            const userId = await getUserId();
            if (userId) {
              api.get<StatusResponse>(`/api/pretests/status/${userId}?type=initial`)
                .then(res => {
                  if (res.data.allCompleted || res.data.totalTests === 0) {
                    setShouldRedirect(true);
                  } else {
                    setStatus(res.data);
                  }
                })
                .catch(() => setError(true))
                .finally(() => setLoading(false));
            } else {
              setLoading(false);
              setError(true);
            }
          }}
        />
      </View>
    );
  }

  // Estado: sin tests pendientes (esto ya no debería ocurrir porque redirigimos antes)
  if (!status) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#666', fontSize: 16 }}>No hay tests disponibles.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={tailwind('items-center pt-10 pb-4')}>
        <Text style={tailwind('text-2xl font-bold text-gray-800')}>Tests para Vibra</Text>
        <Text style={tailwind('text-base text-gray-500 mt-2 text-center px-6')}>
          Completa todos los tests para continuar a las actividades.
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={tailwind('px-6 mb-4')}>
        <View style={tailwind('flex-row justify-between mb-1')}>
          <Text style={tailwind('text-sm text-gray-600')}>
            Progreso: {status.completedTests}/{status.totalTests}
          </Text>
          <Text style={tailwind(`text-sm font-semibold ${status.allCompleted ? 'text-green-600' : 'text-blue-600'}`)}>
            {status.allCompleted ? '✅ Completado' : `${status.pendingTests} pendiente${status.pendingTests !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={tailwind('h-2 bg-gray-200 rounded-full overflow-hidden')}>
          <View
            style={[
              styles.progressBar,
              {
                width: status.totalTests > 0
                  ? `${(status.completedTests / status.totalTests) * 100}%`
                  : '0%',
                backgroundColor: status.allCompleted ? '#10B981' : '#0066FF',
              },
            ]}
          />
        </View>
      </View>

      {/* Lista de tests */}
      <FlatList
        data={status.tests}
        style={tailwind('flex-1 px-4')}
        contentContainerStyle={tailwind('pb-4')}
        keyExtractor={(item) => item.testId}
        renderItem={({ item }) => (
          <View style={[styles.card, item.completed && styles.cardCompleted]}>
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, item.completed ? styles.iconDone : styles.iconPending]}>
                <MaterialIcons
                  name={item.completed ? "check-circle" : "school"}
                  size={28}
                  color={item.completed ? "#10B981" : "#0066FF"}
                />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, item.completed && styles.textDone]}>
                  {item.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.completed && item.score !== undefined && (
                  <Text style={tailwind('text-xs text-green-600 mt-1')}>
                    Puntaje: {item.score} pts
                  </Text>
                )}
              </View>
              <View>
                {item.completed ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Realizado</Text>
                  </View>
                ) : (
                  <TamaguiButton
                    title="Iniciar"
                    icon="play-arrow"
                    iconPosition="left"
                    variantColor="blue"
                    style={styles.actionButton}
                    onPress={() => handleStartTest(item.testId)}
                  />
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={tailwind('py-10 items-center')}>
            <Text style={tailwind('text-gray-400 text-base')}>No hay tests disponibles</Text>
          </View>
        }
      />

      {/* Botón Continuar (deshabilitado si hay tests pendientes) */}
      <View style={styles.buttonContainer}>
        <TamaguiButton
          title={status.allCompleted ? 'Continuar a las actividades' : 'Completa todos los tests para continuar'}
          variantColor={status.allCompleted ? 'green' : 'gray'}
          icon={status.allCompleted ? 'arrow-forward' : 'lock'}
          iconPosition="right"
          fullWidth
          disabled={!status.allCompleted}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconPending: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  iconDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  textDone: {
    color: '#065f46',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  actionButton: {
    height: 36,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});

export default TestListScreen;
