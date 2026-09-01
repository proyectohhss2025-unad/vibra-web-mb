/**
 * @fileoverview Control de tamaño de fuente global (accesibilidad) para mobile.
 * Botón que abre un modal con opciones A− / A+ / Restablecer (100%).
 * La escala la aplica FontScaleProvider a toda la aplicación.
 */
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useFontScale from '@/context/FontScaleContext';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';

const FontSizeControl: React.FC = () => {
  const tailwind = useTailwind();
  const { fontScale, increase, decrease, reset } = useFontScale();
  const [visible, setVisible] = useState(false);

  const percent = Math.round(fontScale * 100);

  return (
    <>
      {/* Botón que abre el modal */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={tailwind(
          'mt-3 flex-row items-center px-6 py-2 bg-indigo-600 rounded-full',
        )}
        accessibilityRole="button"
        accessibilityLabel="Ajustar tamaño de fuente de la aplicación"
      >
        <MaterialCommunityIcons name="format-size" size={18} color="#fff" />
        <Text style={tailwind('text-white text-sm font-medium ml-2')}>
          Tamaño de fuente
        </Text>
      </TouchableOpacity>

      {/* Modal de ajuste */}
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tamaño de fuente</Text>
            <Text style={styles.modalSubtitle}>
              Escala toda la aplicación
            </Text>

            {/* Controles A− / % / A+ */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                onPress={decrease}
                disabled={fontScale <= 0.8}
                style={[styles.roundButton, fontScale <= 0.8 && styles.disabled]}
                accessibilityRole="button"
                accessibilityLabel="Disminuir tamaño de fuente"
              >
                <MaterialIcons name="remove" size={22} color="#0066FF" />
              </TouchableOpacity>

              <View style={styles.percentBox}>
                <Text style={styles.percentText}>{percent}%</Text>
              </View>

              <TouchableOpacity
                onPress={increase}
                disabled={fontScale >= 1.4}
                style={[styles.roundButton, fontScale >= 1.4 && styles.disabled]}
                accessibilityRole="button"
                accessibilityLabel="Aumentar tamaño de fuente"
              >
                <MaterialIcons name="add" size={22} color="#0066FF" />
              </TouchableOpacity>
            </View>

            {/* Restablecer */}
            <TamaguiButton
              neonEffect
              icon="restore"
              variantColor="gray"
              title="Restablecer (100%)"
              onPress={reset}
              style={{ width: '100%', marginTop: 12 }}
            />

            {/* Cerrar */}
            <TamaguiButton
              neonEffect
              icon="close"
              variantColor="blue"
              title="Cerrar"
              onPress={() => setVisible(false)}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.4,
  },
  percentBox: {
    minWidth: 72,
    alignItems: 'center',
  },
  percentText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066FF',
  },
});

export default FontSizeControl;
