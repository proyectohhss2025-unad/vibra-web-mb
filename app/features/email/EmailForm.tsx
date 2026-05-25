import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import api from '../../shared/services/api/api';
import { showTamaguiAlert } from '@/shared/components/ui/tamagui';

interface EmailFormData {
    to: string;
    subject: string;
    message: string;
}

const EmailForm = () => {
    const [formData, setFormData] = useState<EmailFormData>({
        to: 'correo@dominio.com',
        subject: 'Prueba desde React native',
        message: 'Hi ¡Este es un correo de prueba! 🚀',
    });

    const handleSend = async () => {
        try {
            const response: any = await api.post('/email/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: formData.to,
                    subject: formData.subject,
                    html: `<p>${formData.message}</p>`,
                }),
            });

            if (response) {
                showTamaguiAlert(response.message || response.error);
            }
        } catch (error) {
            showTamaguiAlert('Error de conexión');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Para"
                value={formData.to}
                onChangeText={(text) => setFormData({ ...formData, to: text })}
            />
            <TextInput
                placeholder="Asunto"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />
            <TextInput
                placeholder="Mensaje"
                multiline
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
            />
            <Button title="Enviar Correo" onPress={handleSend} />
        </View>
    );
};

export default EmailForm;