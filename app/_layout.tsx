import './shared/i18n/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, Slot } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TailwindProvider } from "tailwind-rn";
import { TamaguiProvider } from 'tamagui';
import { TamaguiAlertProvider } from '@/shared/components/ui/tamagui';
import '../global.css';
import utilities from "../tailwind.json";
import tamaguiConfig from '../config/tamagui.config';
import { UserProvider } from './context/UserContext';
import { ParticipantProvider } from './context/ParticipantContext';
import { AuthProvider } from './context/AuthContext';
import useNetworkStatus from '@/shared/hooks/useNetworkStatus';
import OfflineScreen from '@/shared/components/OfflineScreen';
import OfflineBanner from '@/shared/components/OfflineBanner';
import FloatingFeedbackBtn from '@/shared/components/ui/FloatingFeedbackBtn';

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
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
  useNotificationObserver();

  const { isConnected, checkConnection } = useNetworkStatus();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    checkConnection().then(() => setInitialCheckDone(true));
  }, [checkConnection]);

  const showOfflineScreen = initialCheckDone && !isConnected;

  return (
    <QueryClientProvider client={queryClient}>
      {/* @ts-expect-error — TailwindProvider types don't include children in this version */}
      <TailwindProvider utilities={utilities}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <UserProvider>
          <ParticipantProvider>
          <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {showOfflineScreen ? (
              <OfflineScreen onRetry={() => checkConnection()} />
            ) : (
              <ImageBackground
                source={require("./assets/sponsors/fondo_vibra_new.jpg")}
                style={styles.background}
                resizeMode="cover"
              >
                <StatusBar style="inverted" />
                <TamaguiAlertProvider>
                  <View style={{ flex: 1 }}>
                    <OfflineBanner visible={initialCheckDone && !isConnected} />
                    <Slot />
                    <FloatingFeedbackBtn />
                  </View>
                </TamaguiAlertProvider>
              </ImageBackground>
            )}
          </GestureHandlerRootView>
          </AuthProvider>
          </ParticipantProvider>
        </UserProvider>
        </TamaguiProvider>
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
