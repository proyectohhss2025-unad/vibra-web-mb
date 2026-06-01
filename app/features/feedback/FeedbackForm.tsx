/**
 * FeedbackForm — Formulario de sugerencia/apoyo con confirmación visual
 *
 * Muestra un mensaje de éxito/error después del envío usando Alert.
 */
import api from '@/shared/services/api/api';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useTailwind } from 'tailwind-rn';

export default function FeedbackForm() {
  const tw = useTailwind();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'improvement' | 'support'>('improvement');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/api/feedback', {
        title: title.trim(),
        description: description.trim(),
        isFeature: type === 'improvement',
        isSupport: type === 'support',
      });
      Alert.alert(
        '¡Gracias por tu sugerencia!',
        'Hemos recibido tu feedback correctamente.',
        [{ text: 'OK' }],
      );
      setTitle('');
      setDescription('');
    } catch {
      Alert.alert(
        'Error al enviar',
        'No pudimos enviar tu feedback. Intenta de nuevo más tarde.',
        [{ text: 'OK' }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={tw('p-4')}>
      <Text style={tw('text-lg font-bold mb-4')}>Enviar feedback</Text>

      <View style={tw('flex-row mb-4 gap-2')}>
        <Button
          mode={type === 'improvement' ? 'contained' : 'outlined'}
          onPress={() => setType('improvement')}
          compact
        >
          Sugerencia
        </Button>
        <Button
          mode={type === 'support' ? 'contained' : 'outlined'}
          onPress={() => setType('support')}
          compact
        >
          Solicitar apoyo
        </Button>
      </View>

      <TextInput
        label="Título"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={tw('mb-3')}
      />

      <TextInput
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={tw('mb-4')}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting || !title.trim() || !description.trim()}
      >
        {submitting ? 'Enviando...' : 'Enviar feedback'}
      </Button>
    </View>
  );
}
