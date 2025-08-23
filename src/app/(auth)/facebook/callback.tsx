import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { authApi } from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

const FacebookCallback = () => {
  const { setUserAndTokenFully } = useAuth();
  const { replace } = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const rawCode = params.code as string | string[] | undefined;
      const rawState = params.state as string | string[] | undefined;
      const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
      const state = Array.isArray(rawState) ? rawState[0] : rawState;

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
        const noAuth = axios.create({ baseURL: authApi.defaults.baseURL });

        const callbackCandidates = [
          `/instagram/oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
          `/auth/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
          `/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        ];

        let cbData: any | null = null;
        let lastErr: any;

        for (const path of callbackCandidates) {
          try {
            const r = await noAuth.get(path);
            cbData = r.data;
            break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (!cbData) throw lastErr || new Error("Callback failed");

        if (cbData?.access_token && cbData?.user) {
          await setUserAndTokenFully(cbData.user, cbData.access_token, cbData.refresh_token);
          Toast.show({
            type: "success",
            text1: "Welcome!",
            text2: `Logged in as ${cbData.user?.name || ""}`,
          });
          replace("/home");
          return;
        }

        const email = cbData?.email;
        if (!email) throw new Error("Email not returned from OAuth callback");

        const loginCandidates = [
          { method: "post", path: "/instagram/facebook-login" },
          { method: "post", path: "/auth/facebook/login" },
        ] as const;

        let loginRes: any | null = null;
        for (const c of loginCandidates) {
          try {
            const r = await noAuth.post(c.path, { email });
            loginRes = r.data;
            break;
          } catch {}
        }
        if (!loginRes?.token || !loginRes?.user) {
          throw new Error("Login exchange failed");
        }

        await setUserAndTokenFully(loginRes.user, loginRes.token, loginRes.refresh_token);
        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: `Logged in as ${loginRes.user?.name || ""}`,
        });
        replace("/home");
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Login failed. Try again.";
        Toast.show({ type: "error", text1: "Something went wrong", text2: message });
        replace("/sign-in");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [params, replace, setUserAndTokenFully]);

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
