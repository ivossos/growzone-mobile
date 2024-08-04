import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"

export default function AuthLayout() {
 
  return (
    <>
    <Stack>
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
    </Stack>

    <StatusBar backgroundColor="#161622" style="light" />
  </>
  );
}
