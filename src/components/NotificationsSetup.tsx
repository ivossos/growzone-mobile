/**
 * Notifications Setup Component
 * Initializes push notifications for the app
 * Use this in your root layout (_layout.tsx)
 */

import { useEffect } from "react";
import { useRouter } from "expo-router";
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  updateBadgeFromUnreadCount,
  ChatNotificationData,
} from "@/services/notifications";
import * as Notifications from "expo-notifications";

export function NotificationsSetup() {
  const router = useRouter();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log("Push token registered:", token);
      }
    });

    // Update badge count from unread messages
    updateBadgeFromUnreadCount();

    // Listen for notifications received while app is open
    const notificationListener = addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log("Notification received:", notification);

        // Update badge count
        updateBadgeFromUnreadCount();

        // You can show in-app notification here if needed
        const data = notification.request.content.data as ChatNotificationData;

        if (data.type === "new_message") {
          // Optionally show a toast/banner
          console.log(`New message from ${data.senderName}`);
        }
      }
    );

    // Listen for notification responses (user tapped notification)
    const responseListener = addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as ChatNotificationData;

        console.log("Notification tapped:", data);

        // Navigate to appropriate screen
        if (data.type === "new_message" && data.conversationId) {
          router.push(`/chat/${data.conversationId}`);
        }

        // Clear badge
        updateBadgeFromUnreadCount();
      }
    );

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router]);

  return null; // This component doesn't render anything
}
