import "react-native-reanimated";
import "@/styles/global.css";

import { useEffect } from "react";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";

import Toast from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContextProvider } from "@/context/auth-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationPushProvider } from "@/context/notification-push-context";
import { colors } from "@/styles/colors";

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
      <ThemeProvider value={DarkTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthContextProvider>
            <GestureHandlerRootView
              style={{ flex: 1, backgroundColor: colors.black[100] }}
            >
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.black[100] },
                  }}
                />
                <Stack.Screen
                  name="weestory"
                  options={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.black[100] },
                  }}
                />
                <Stack.Screen
                  name="profile"
                  options={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.black[100] },
                  }}
                />
                <Stack.Screen
                  name="followers"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="following"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="post" options={{ headerShown: false }} />
                <Stack.Screen
                  name="edit-post"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="edit-reels-post"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="edit-grow-post"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(drawer)"
                  options={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.black[100] },
                  }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <Toast />
            </GestureHandlerRootView>
          </AuthContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NotificationPushProvider>
  );
}
