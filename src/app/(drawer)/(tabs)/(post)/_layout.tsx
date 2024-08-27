import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"

export default function AuthLayout() {
 
  return (
    <>
    <Stack>
      <Stack.Screen
        name="likes"
        options={{
          headerShown: false,
        }}
      />
    </Stack>

    <StatusBar backgroundColor="#000000" style="light" />
  </>
  );
}
