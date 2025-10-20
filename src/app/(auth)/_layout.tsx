import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "@/styles/global.css"
import { useAuth } from '@/hooks/use-auth';
import Loader from '@/components/ui/loader';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const { user, isLoadingUserStorage } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run this check once when the component mounts
    // to avoid interfering with the login flow
    if (user?.id && !isLoadingUserStorage && !hasChecked) {
      setHasChecked(true);

      // 🧪 DEV MODE: Skip navigation guards for mock users
      if (user.id.startsWith('mock-')) {
        console.warn('⚠️ DEV MODE: Mock user detected in auth layout - redirecting to home');
        router.replace('/home');
        return;
      }

      // Apply navigation guards for real users only
      if (!user.is_verified) {
        router.replace('/verify-user');
      } else if (!user.has_username) {
        router.replace('/set-username');
      } else if (user.username && (!user.category_id || user.category_id === 0)) {
        router.replace('/user-category');
      } else {
        router.replace('/home');
      }
    }
  }, [user?.id, isLoadingUserStorage, hasChecked]);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="age-decision"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="unauthorized-access"
          options={{
            headerShown: false,
          }}
        />
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
          name="terms"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="term-detail"
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
        <Stack.Screen
          name="verify-user"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="set-username"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <Loader isLoading={isLoadingUserStorage} />
      <StatusBar backgroundColor="#000000" style="light" />
    </>
  );
}
