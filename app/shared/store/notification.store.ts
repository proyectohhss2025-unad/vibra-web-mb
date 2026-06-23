import { create } from 'zustand';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  isPush: boolean;
}

interface NotificationState {
  notifications: PushNotification[];
  addNotification: (notification: PushNotification) => void;
  clearNotifications: () => void;
}

const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationStore;
