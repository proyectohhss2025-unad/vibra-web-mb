import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import eventBus from '@shared/utils/event-bus';

interface NetworkStatus {
  isConnected: boolean;
  checkConnection: () => Promise<boolean>;
}

const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? true;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsConnected(navigator.onLine);

      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    const unsubscribeEventBus = eventBus.on('network_error', () => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeNetInfo();
      unsubscribeEventBus();
    };
  }, []);

  return { isConnected, checkConnection };
};

export default useNetworkStatus;
