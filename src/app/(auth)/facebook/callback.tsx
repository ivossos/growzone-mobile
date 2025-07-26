import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams  } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { useAuth } from "@/hooks/use-auth";

const FacebookCallback = () => {
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
        const callbackRes = await axios.get(
          `https://dev1.auth.growzone.co/api/v1/instagram/oauth-callback?code=${code}&state=${state}`
        );

        const { email, name } = callbackRes.data;

        const loginRes = await axios.post(
          "https://dev1.auth.growzone.co/api/v1/instagram/facebook-login",
          { email }
        );

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
          error?.response?.data?.message || "Login failed. Try again.";

        if (message.includes("not a business account")) {
          Toast.show({
            type: "error",
            text1: "Facebook account invalid",
            text2: "Only Facebook Business accounts are supported.",
          });
        } else if (message.includes("already in use")) {
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
  }, [params]);

  return (
    <SafeAreaView className="flex-1 bg-black-100 justify-center items-center px-6">
      {isProcessing ? (
        <>
          <ActivityIndicator size="large" color="#32CD32" />
          <Text className="text-white mt-4">Finishing Facebook login...</Text>
        </>
      ) : null}
    </SafeAreaView>
  );
};

export default FacebookCallback;
