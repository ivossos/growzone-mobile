import React, { createContext, useEffect, useState } from "react";
import { getNotificationCount } from "@/api/social/notification/get-notification-count";

interface NotificationContextProps {
  notificationCount: number;
  fetchNotificationCount: () => Promise<void>;
  clearNotifications: () => void; 
  loading: boolean;
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotificationCount = async () => {
    try {
      if (loading) return;

      setLoading(true);
      const data = await getNotificationCount();
      setNotificationCount(data.notification_count);
    } catch (error) {
      console.error("Erro ao buscar notificações: ", error);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  useEffect(() => {
    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 1 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        fetchNotificationCount,
        clearNotifications,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};