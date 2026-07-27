import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import LoginScreen from './features/auth/LoginScreen';
// Import the global.css file in the index.js file:
import '../global.css';
import { ActivityService } from '@shared/services/api/api';
import useNotificationStore from '@shared/store/notification.store';

// First, set the handler that will cause the notification
// to show the alert
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // Second, call scheduleNotificationAsync()
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tienes una nueva notificación de Vibra',
      body: "Se ha actualizado el ranking del día!",
    },
    trigger: null,
  });
}

const Index: React.FC = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

      if (Platform.OS === 'android') {
        Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
      }

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
        useNotificationStore.getState().addNotification({
          id: notification.request.identifier,
          title: notification.request.content.title ?? 'Notificación Push',
          message: notification.request.content.body ?? 'Mensaje de notificación',
          isPush: true,
        });
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
    }
  }, []);

  async function schedulePushNotification() {
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You've got mail! 📬",
          body: 'Here is the notification body',
          data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
    }
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') {
      return null;
    }
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);

        // Enviar token al backend
        try {
          await ActivityService.registerPushToken(token, Platform.OS);
          console.log('Push token registered on backend');
        } catch (err) {
          console.error('Error registering push token on backend:', err);
        }
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Debe utilizar un dispositivo físico para las notificaciones push');
    }

    return token;
  }

  return (
    <LoginScreen />
  );
}

export default Index;