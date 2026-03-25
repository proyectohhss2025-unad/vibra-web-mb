import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

// Tipo para las notificaciones
type Notification = {
    id: string;
    title: string;
    message: string;
    isPush: boolean; // Indica si es una notificación push
};

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Configurar Push Notifications
    useEffect(() => {
        // Configuración de react-native-push-notification
        /*PushNotification.configure({
            onNotification: function (notification: any) {
                console.log('Notificación recibida:', notification);
                addNotification({
                    id: notification.id,
                    title: notification.title || 'Notificación Push',
                    message: notification.message || 'Mensaje de notificación',
                    isPush: true,
                });
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: true,
        });

        // Escuchar notificaciones en primer plano (Firebase)
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            Alert.alert(
                remoteMessage.notification?.title ?? 'Notificación Push',
                remoteMessage.notification?.body,
            );
            addNotification({
                id: remoteMessage.messageId ?? String(Date.now()),
                title: remoteMessage.notification?.title ?? 'Notificación Push',
                message: remoteMessage.notification?.body ?? 'Mensaje de notificación',
                isPush: true,
            });
        });

        return () => unsubscribe();*/
    }, []);

    // Agregar una notificación interna
    const addInternalNotification = () => {
        const newNotification: Notification = {
            id: String(Date.now()),
            title: 'Notificación Interna',
            message: 'Esta es una notificación generada dentro de la aplicación.',
            isPush: false,
        };
        addNotification(newNotification);
    };

    // Agregar una notificación a la lista
    const addNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
    };

    // Renderizar una notificación
    const renderNotification = ({ item }: { item: Notification }) => (
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