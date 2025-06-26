import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/lib/notification-push-expo";
import { createTokenNotification } from "@/api/social/user/create-token-notification-user";

interface NotificationPushContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationPushContext = createContext<
  NotificationPushContextType | undefined
>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationPushProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const getTokenPushNotification = async () => {
    let token: string | null = null;
    try {
      token = await registerForPushNotificationsAsync();

      setExpoPushToken(token);
    } catch (e) {
      const errorToken = e as Error;
      setError(errorToken);
    }

    return { token };
  };

  useEffect(() => {
    const setupNotifications = async () => {
      const { token } = await getTokenPushNotification();
      if (token) {
        await createTokenNotification(token);
      }

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification Received: ", notification);
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(
            "Notification Response: ",
            JSON.stringify(response, null, 2),
            JSON.stringify(response.notification.request.content.data, null, 2)
          );
        });
    };

    setupNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationPushContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationPushContext.Provider>
  );
};

export const useNotificationPush = () => {
  const context = useContext(NotificationPushContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationPushProvider"
    );
  }
  return context;
};
