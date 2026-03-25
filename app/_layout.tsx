import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, Slot, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from "react";
import { ImageBackground, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TailwindProvider } from "tailwind-rn";
import '../global.css';
import utilities from "../tailwind.json";
import { UserProvider } from './context/UserContext';
import useAuth from "./shared/hooks/useAuth";

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }
    if (Platform.OS !== 'web') {
      Notifications.getLastNotificationResponseAsync()
        .then(response => {
          if (!isMounted || !response?.notification) {
            return;
          }
          redirect(response?.notification);
        });
    }
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth().then((authenticated: any) => {
      console.log("Authenticated:", authenticated);
      if (isAuthenticated) {
        router.replace('/features/(tabs)/one');
      } else {
        //router.replace('/');
        router.replace('/features/(tabs)/one');
      }
    });
  }, []);

  useNotificationObserver();
  return (
    <QueryClientProvider client={queryClient}>
      <TailwindProvider utilities={utilities}>
        <UserProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
              source={require("./assets/sponsors/fondo_vibra_new.jpg")}
              style={styles.background}
              resizeMode="cover"
            >
              <StatusBar style="inverted" />
              <Slot />
            </ImageBackground>
          </GestureHandlerRootView>
        </UserProvider>
      </TailwindProvider>
    </QueryClientProvider>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
