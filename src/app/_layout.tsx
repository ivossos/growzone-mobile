import "@/styles/global.css";
import "react-native-reanimated";

import { useEffect } from "react";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";

import Toast from "react-native-toast-message";

import { AuthContextProvider } from "@/context/auth-context";
import { NotificationPushProvider } from "@/context/notification-push-context";
import { queryClient } from "@/lib/react-query";
import { colors } from "@/styles/colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });

    return Promise.resolve();
  }
);
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontLoaded, error] = useFonts({
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, error]);

  if (!fontLoaded && !error) {
    return null;
  }

  return (
    <NotificationPushProvider>
      <ActionSheetProvider>
        <ThemeProvider value={DarkTheme}>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
              <GestureHandlerRootView
                style={{ flex: 1, backgroundColor: colors.black[100] }}
              >
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(drawer)" />
                  <Stack.Screen name="test-chat" />
                  <Stack.Screen name="test-weestory" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="weestory" />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="followers" />
                  <Stack.Screen name="following" />
                  <Stack.Screen name="post" />
                  <Stack.Screen name="edit-post" />
                  <Stack.Screen name="edit-reels-post" />
                  <Stack.Screen name="edit-grow-post" />
                </Stack>
                <Toast />
              </GestureHandlerRootView>
            </AuthContextProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ActionSheetProvider>
    </NotificationPushProvider>
  );
}
