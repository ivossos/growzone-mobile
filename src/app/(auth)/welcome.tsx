import { useState } from "react";
import { View, Text, Image, TouchableOpacity, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from "expo-constants";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Mail } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

import images from "@/constants/images";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { appleLogin } from "@/api/auth/apple-login";

import Loader from "@/components/ui/loader";
import { colors } from "@/styles/colors";
import { getCurrentUser } from '@/api/social/user/get-current-user';
import { authApi } from '@/lib/axios';

export default function Welcome() {
  const { user, isLoadingUserStorage, setUserAndTokenFully, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user?.id && !isLoadingUserStorage) {
    return <Redirect href="/home" />;
  }

  const handleEmailLogin = () => {
    router.push("/sign-in");
  }

  async function handleAppleLogin() {
    try {
      setIsLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      const loginData = {
        identity_token: credential.identityToken,
        user_id: credential.user,
        name: credential.fullName?.givenName && credential.fullName?.familyName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : undefined,
        email: credential.email || undefined
      };

      const response = await appleLogin(loginData);

      if (!response.user_id) {
        throw new Error("No user ID received from Apple");
      }

      const authUser = await getCurrentUser({
        Authorization: `Bearer ${response.access_token}`,
      });

      const userData = {
        id: response.user_id,
        email: response.email || "",
        category_id: authUser.category_id,
        username: authUser.username,
        has_username: authUser.username !== null ? true : false,
        is_active: true,
        is_verified: true,
      };

      await setUserAndTokenFully(userData, response.access_token, response.refresh_token);

      showSuccess(`Bem vindo! Logado como ${response.name || response.email}`);

      if (userData.has_username) {
        router.replace("/home");
      } else {
        router.replace("/set-username");
      }
    } catch (e: any) {
      console.log("Handle Apple Login Error: ", e);
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }

      const message = e?.message || "Apple login failed. Try again.";
      showError(`Login failed: ${message}`);
      console.error("Apple login error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const noAuth = axios.create({ baseURL: authApi.defaults.baseURL });

      const candidates = [
        "/auth/facebook/oauth-url",
        "/facebook/oauth-url",
        "/instagram/facebook/oauth-url",
        "/instagram/oauth-url",
      ];

      let authorization_url: string | undefined;

      for (const path of candidates) {
        try {
          const r = await noAuth.get(path);
          authorization_url = r.data?.authorization_url || r.data?.url;
          if (authorization_url) break;
        } catch (e: any) {
          const s = e?.response?.status;
          if (s !== 404 && s !== 401 && s !== 403) {
            throw e;
          }
        }
      }

      if (!authorization_url) {
        throw new Error("Authorization URL not returned by backend");
      }

      showSuccess("Redirecting to Facebook…");
      await Linking.openURL(authorization_url);
    } catch (err: any) {
      console.log("Handle Facebook Login Error: ", err);
      showError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to start Facebook login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={["top"]}>
        <Loader isLoading={isLoadingUserStorage || isLoading} />
        <View className="bg-black-100 w-full flex items-center justify-center h-full px-6">
          <View className="flex items-center justify-center gap-6 my-10">
            <Image
              source={images.logoGreen}
              className="w-[250px] h-10"
              resizeMode="contain"
            />
            <View className="flex gap-2">
              <Text className="text-3xl font-semibold text-white text-center">
                Junte-se à comunidade Growzone
              </Text>
              <Text className="text-lg font-regular text-black-30 text-center">
                Conecte-se, aprenda e cresça na cultura do cannabis!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleEmailLogin}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading || isLoadingUserStorage}
          >
            <Mail width={24} height={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium">
              Continuar com Usuário ou Email
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={handleFacebookLogin}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading || isLoadingUserStorage}
          >
            <FontAwesome name="facebook" size={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium">
              Continuar com Facebook
            </Text>
          </TouchableOpacity> */}

          {Platform.OS === "ios" && (
            <TouchableOpacity
              onPress={handleAppleLogin}
              activeOpacity={0.7}
              className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
              disabled={isLoading || isLoadingUserStorage}
            >
              <FontAwesome name="apple" size={24} color={colors.primary} />
              <Text className="text-white text-lg font-medium text-center">
                Continuar com Apple
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
}
