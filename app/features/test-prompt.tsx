/**
 * TestPromptScreen — Pantalla intersticial para tests iniciales/finales
 *
 * Se muestra cuando:
 * - type=initial: Después del login, antes del dashboard
 * - type=final: Antes del logout, antes de limpiar sesión
 */
import { TestsApi } from '@/shared/services/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Surface, Text, Button } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { useTailwind } from 'tailwind-rn';

export default function TestPromptScreen() {
  const { type, userId } = useLocalSearchParams<{ type: string; userId: string }>();
  const router = useRouter();
  const tw = useTailwind();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !userId) return;
    loadPendingTests();
  }, [type, userId]);

  const loadPendingTests = async () => {
    try {
      const result = await TestsApi.getPendingByType(type as 'initial' | 'final', userId);
      setTests(result.data || []);
    } catch {
      // Si falla, continuar
      handleContinue();
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (type === 'final') {
      // Logout definitivo
      if (Platform.OS === 'web') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('participant');
      } else {
        await SecureStore.deleteItemAsync('authToken');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('participant');
      }
      router.replace('/');
    } else {
      // Ir al dashboard
      router.replace('/features/(tabs)/one');
    }
  };

  const openTest = (testId: string) => {
    router.push(`/features/test/TestModalScreen?testId=${testId}`);
  };

  if (loading) {
    return (
      <View style={tw('flex-1 justify-center items-center bg-white')}>
        <ActivityIndicator size="large" />
        <Text style={tw('mt-4 text-gray-500')}>Verificando tests pendientes...</Text>
      </View>
    );
  }

  return (
    <View style={tw('flex-1 bg-white')}>
      <View style={tw('px-6 pt-16 pb-4')}>
        <Text style={tw('text-2xl font-bold text-gray-800')}>
          {type === 'initial' ? 'Tests iniciales' : 'Tests finales'}
        </Text>
        <Text style={tw('text-sm text-gray-500 mt-1')}>
          {type === 'initial'
            ? 'Completa estos tests antes de continuar'
            : 'Completa estos tests antes de cerrar sesión'}
        </Text>
      </View>

      <View style={tw('flex-1 px-6')}>
        {tests.length === 0 ? (
          <View style={tw('flex-1 justify-center items-center')}>
            <Text style={tw('text-gray-400 text-base')}>No hay tests pendientes</Text>
            <Button mode="contained" onPress={handleContinue} style={tw('mt-4')}>
              Continuar
            </Button>
          </View>
        ) : (
          tests.map((test: any) => (
            <Surface key={test._id || test.testId} style={tw('p-4 mb-3 rounded-xl')}>
              <Text style={tw('font-semibold text-gray-800')}>{test.title}</Text>
              <Text style={tw('text-xs text-gray-500 mt-1')}>{test.description}</Text>
              <Button
                mode="outlined"
                onPress={() => openTest(test.testId)}
                style={tw('mt-3')}
              >
                Realizar test
              </Button>
            </Surface>
          ))
        )}
      </View>

      {tests.length > 0 && (
        <View style={tw('px-6 pb-8')}>
          <Button mode="contained" onPress={handleContinue}>
            {type === 'final' ? 'Cerrar sesión' : 'Ir al inicio'}
          </Button>
        </View>
      )}
    </View>
  );
}
