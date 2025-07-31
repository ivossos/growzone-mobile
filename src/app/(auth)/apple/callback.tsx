import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/hooks/use-auth";
import { authDevApi } from "@/lib/axios";

const AppleCallback = () => {
  const { setUserAndTokenFully } = useAuth();
  const { replace } = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = params.code as string | undefined;
      const state = params.state as string | undefined;

      if (!code || !state) {
        Toast.show({
          type: "error",
          text1: "Invalid redirect",
          text2: "Missing authorization parameters",
        });
        replace("/sign-in");
        return;
      }

      try {
        const callbackRes = await authDevApi.get(
          `/apple/oauth-callback?code=${code}&state=${state}`
        );

        const { email, name } = callbackRes.data;
        if (!email) {
          throw new Error("Email not returned from OAuth callback");
        }

        const loginRes = await authDevApi.post("/apple/apple-login", { email });
        const { token, user } = loginRes.data;

        await setUserAndTokenFully(user, token);

        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: `Logged in as ${user.name}`,
        });

        replace("/home");
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || "Login failed. Try again.";

        if (message.includes("already in use")) {
          Toast.show({
            type: "error",
            text1: "Account already exists",
            text2: "Try logging in instead.",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Something went wrong",
            text2: message,
          });
        }

        replace("/sign-in");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <SafeAreaView className="flex-1 bg-black-100 justify-center items-center px-6">
      {isProcessing ? (
        <>
          <ActivityIndicator size="large" color="#32CD32" />
          <Text className="text-white mt-4">Finishing Apple login...</Text>
        </>
      ) : null}
    </SafeAreaView>
  );
};

export default AppleCallback;
