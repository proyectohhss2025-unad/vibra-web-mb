import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import useNotificationStore from '../../shared/store/notification.store';

const NotificationsScreen = () => {
    const notifications = useNotificationStore((s) => s.notifications);
    const addNotification = useNotificationStore((s) => s.addNotification);

    // Agregar una notificación interna
    const addInternalNotification = () => {
        addNotification({
            id: String(Date.now()),
            title: 'Notificación Interna',
            message: 'Esta es una notificación generada dentro de la aplicación.',
            isPush: false,
        });
    };

    // Renderizar una notificación
    const renderNotification = ({ item }: { item: { id: string; title: string; message: string; isPush: boolean } }) => (
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.message}</Text>
            <Text style={{ color: 'gray' }}>
                {item.isPush ? 'Push Notification' : 'Internal Notification'}
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Button title="Agregar Notificación Interna" onPress={addInternalNotification} />

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No hay notificaciones.</Text>}
            />
        </View>
    );
};

export default NotificationsScreen;