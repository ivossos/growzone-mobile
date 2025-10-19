/**
 * Push Notifications Service
 * Handles Expo push notifications for chat messages
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { socialApi } from "@/lib/axios";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  platform: "ios" | "android" | "web";
  deviceId?: string;
}

/**
 * Register for push notifications and get token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    // Get push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.error("Project ID not found in app config");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;

    // Configure channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("chat-messages", {
        name: "Mensagens",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        lightColor: "#2CC420",
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync("chat-calls", {
        name: "Chamadas",
        importance: Notifications.AndroidImportance.MAX,
        sound: "ringtone",
        vibrationPattern: [0, 1000, 500, 1000],
        lightColor: "#2CC420",
      });
    }

    // Send token to backend
    await savePushTokenToBackend(token);

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Save push token to backend
 */
async function savePushTokenToBackend(token: string): Promise<void> {
  try {
    await socialApi.post("/push-tokens", {
      token,
      platform: Platform.OS,
      device_id: Constants.deviceId,
    });
    console.log("Push token saved to backend");
  } catch (error) {
    console.error("Error saving push token:", error);
  }
}

/**
 * Remove push token from backend (on logout)
 */
export async function removePushToken(token: string): Promise<void> {
  try {
    await socialApi.delete("/push-tokens", {
      data: { token },
    });
    console.log("Push token removed from backend");
  } catch (error) {
    console.error("Error removing push token:", error);
  }
}

/**
 * Schedule a local notification (for testing or offline messages)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
        badge: 1,
      },
      trigger: null, // Show immediately
    });
    return id;
  } catch (error) {
    console.error("Error scheduling local notification:", error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Error setting badge count:", error);
  }
}

/**
 * Listen for notifications
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Listen for notification responses (user tapped notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listener
 */
export function removeNotificationSubscription(
  subscription: Notifications.Subscription
): void {
  Notifications.removeNotificationSubscription(subscription);
}

/**
 * Get unread message count for badge
 */
export async function updateBadgeFromUnreadCount(): Promise<void> {
  try {
    const response = await socialApi.get("/chat/unread-count");
    const count = response.data.data.count || 0;
    await setBadgeCount(count);
  } catch (error) {
    console.error("Error updating badge count:", error);
  }
}

/**
 * Send test notification (for development)
 */
export async function sendTestNotification(): Promise<void> {
  await scheduleLocalNotification(
    "Teste de Notificação",
    "Esta é uma notificação de teste do Growzone! 🌱",
    { type: "test" }
  );
}

// Notification types for chat
export enum ChatNotificationType {
  NEW_MESSAGE = "new_message",
  TYPING = "typing",
  CALL_INCOMING = "call_incoming",
  CALL_MISSED = "call_missed",
  GROUP_INVITE = "group_invite",
}

export interface ChatNotificationData {
  type: ChatNotificationType;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageId?: string;
  messageText?: string;
}

/**
 * Handle incoming chat notification
 */
export function handleChatNotification(
  data: ChatNotificationData,
  navigate: (conversationId: string) => void
): void {
  switch (data.type) {
    case ChatNotificationType.NEW_MESSAGE:
      // Navigate to conversation
      navigate(data.conversationId);
      break;

    case ChatNotificationType.CALL_INCOMING:
      // Navigate to call screen
      console.log("Incoming call from:", data.senderName);
      break;

    case ChatNotificationType.GROUP_INVITE:
      // Navigate to group
      navigate(data.conversationId);
      break;

    default:
      console.log("Unknown notification type:", data.type);
  }
}
