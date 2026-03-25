import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import LoginForm from './features/login/LoginForm';
// Import the global.css file in the index.js file:
import '../global.css';
//import messaging from '@react-native-firebase/messaging';

// Solicitar permisos para notificaciones (iOS)
/*messaging()
  .requestPermission()
  .then((authStatus: any) => {
    console.log('Estado de autorización:', authStatus);
  })
  .catch((error: any) => {
    console.log('Error al solicitar permisos:', error);
  });

// Escuchar notificaciones en segundo plano (Firebase)
messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
  console.log('Notificación en segundo plano:', remoteMessage);
});*/

// First, set the handler that will cause the notification
// to show the alert
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
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
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

      if (Platform.OS === 'android') {
        Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
      }

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        notificationListener.current &&
          Notifications.removeNotificationSubscription(notificationListener.current);
        responseListener.current &&
          Notifications.removeNotificationSubscription(responseListener.current);
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
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Debe utilizar un dispositivo físico para las notificaciones push');
    }

    return token;
  }

  return (
    <ImageBackground
      source={require('./assets/sponsors/fondo_vibra_new.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <LoginForm />
        <View style={{ padding: 20, marginTop: 120 }}>
          {/*<Text style={{ fontSize: 20, marginBottom: 1 }}>Almacenamiento en local</Text>
          <LocalStorageComponent key="nombreUsuario" label="Nombre de Usuario" defaultValue="Invitado" />
          <LocalStorageComponent key="ultimoAcceso" label="Último Acceso" defaultValue="ultimoAcceso" />
          <LocalStorageComponent key="theme" label="Tema" defaultValue="light" />*/}
        </View>
        <Text style={{ fontSize: 16, marginBottom: 10, color: '#FFFFFF' }}>Desarrollado por equipo Vibra</Text>
        <StatusBar style="auto" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Index;