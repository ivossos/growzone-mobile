import { NotificationContext } from "@/context/notification-context";
import { useContext } from "react";

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext deve ser usado dentro de um NotificationProvider");
  }
  return context;
};
