/**
 * TestPromptScreen — Pantalla intersticial para tests iniciales/finales
 *
 * Mismo estilo visual que TestListScreen.
 *
 * Se muestra cuando:
 * - type=initial: Después del login, antes del dashboard
 * - type=final: Antes del logout, antes de limpiar sesión
 */
import { TestsApi } from '@shared/services/api/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import useAuthContext from '@/context/AuthContext';

export default function TestPromptScreen() {
  const { type, userId } = useLocalSearchParams<{ type: string; userId: string }>();
  const router = useRouter();
  const { logout } = useAuthContext();
  const [tests, setTests] = useState<any[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const isFinal = type === 'final';

  // Refrescar tests al ganar foco (vuelve de TestModalScreen)
  useFocusEffect(
    useCallback(() => {
      if (!type || !userId) return;
      loadPendingTests();
    }, [type, userId]),
  );

  const loadPendingTests = async () => {
    setLoading(true);
    try {
      const result = await TestsApi.getPendingByType(type as 'initial' | 'final', userId);
      setTests(result.data || []);
      // Guardar el total inicial solo la primera vez
      if (initialTotal === 0 && result.total > 0) {
        setInitialTotal(result.total);
      }
    } catch {
      // Si falla la consulta, en flujo initial redirigimos al dashboard
      // en flujo final no hacemos nada (el botón sigue deshabilitado)
      if (type === 'initial') {
        handleContinue();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (isFinal) {
      // Logout usando AuthContext: limpia storage, resetea estados y redirige a login
      await logout();
    } else {
      // Ir al dashboard
      router.replace('/features/(tabs)/one');
    }
  };

  const openTest = (testId: string) => {
    router.push(`/features/test/TestModalScreen?testId=${testId}`);
  };

  // ―――――――――――――――――――――――――――――――――
  // Render
  // ―――――――――――――――――――――――――――――――――

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={{ color: '#666', fontSize: 14, marginTop: 12 }}>
          Verificando tests pendientes...
        </Text>
      </View>
    );
  }

  const allCompleted = tests.length === 0;
  const completedCount = initialTotal - tests.length;
  const progressPct = initialTotal > 0 ? (completedCount / initialTotal) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1f2937' }}>
          {isFinal ? 'Tests finales' : 'Tests iniciales'}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' }}>
          {isFinal
            ? 'Completa todos los tests antes de cerrar sesión'
            : 'Completa estos tests antes de continuar'}
        </Text>
      </View>

      {/* Progress bar (solo si hay tests y tenemos referencia de total) */}
      {!allCompleted && initialTotal > 0 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: '#4b5563' }}>
              Progreso: {completedCount}/{initialTotal}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#0066FF' }}>
              {tests.length} pendiente{tests.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPct}%`, backgroundColor: '#0066FF' },
              ]}
            />
          </View>
        </View>
      )}

      {/* Lista de tests */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {allCompleted ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name="check-circle" size={56} color="#10B981" />
            <Text style={{ color: '#4b5563', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
              {isFinal
                ? 'Todos los tests han sido completados'
                : 'No hay tests pendientes'}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
              {isFinal
                ? 'Ya puedes cerrar sesión'
                : 'Ya puedes continuar a las actividades'}
            </Text>
            <View style={{ marginTop: 24, width: '100%', paddingHorizontal: 32 }}>
              <TamaguiButton
                title={isFinal ? 'Cerrar sesión' : 'Continuar'}
                variantColor={isFinal ? 'red' : 'green'}
                icon={isFinal ? 'logout' : 'arrow-forward'}
                iconPosition="right"
                fullWidth
                onPress={handleContinue}
              />
            </View>
          </View>
        ) : (
          tests.map((test: any) => (
            <View key={test._id || test.testId} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, styles.iconPending]}>
                  <MaterialIcons name="school" size={28} color="#0066FF" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{test.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {test.description}
                  </Text>
                </View>
                <View>
                  <TamaguiButton
                    title="Iniciar"
                    icon="play-arrow"
                    iconPosition="left"
                    variantColor="blue"
                    style={styles.actionButton}
                    onPress={() => openTest(test.testId)}
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Botón de acción inferior */}
      {!allCompleted && (
        <View style={styles.buttonContainer}>
          <TamaguiButton
            title={
              isFinal
                ? 'Completa todos los tests para continuar'
                : 'Completa todos los tests para continuar'
            }
            variantColor="gray"
            icon="lock"
            iconPosition="right"
            fullWidth
            disabled
            onPress={() => {}}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
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
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
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
