import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"

export default function AuthLayout() {
 
  return (
    <>
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>

    <StatusBar backgroundColor="#000000" style="light" />
  </>
  );
}
