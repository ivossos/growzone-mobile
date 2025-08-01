import { useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AppleAuthentication from 'expo-apple-authentication';
import axios from "axios";

import { ArrowRight, Mail } from "lucide-react-native";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";

import images from "@/constants/images";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { appleLogin } from "@/api/auth/apple-login";

import Button from "@/components/ui/button";
import Divider from "@/components/ui/divider";
import Loader from "@/components/ui/loader";
import { colors } from "@/styles/colors";

const Welcome = () => {
  const { user, isLoadingUserStorage, setUserAndTokenFully } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user?.id && !isLoadingUserStorage) return <Redirect href="/home" />;

  function handleEmailLogin() {
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

      // Preparar dados para envio conforme documentação
      const loginData = {
        identity_token: credential.identityToken,
        user_id: credential.user,
        name: credential.fullName?.givenName && credential.fullName?.familyName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : undefined,
        email: credential.email || undefined
      };

      // Chamar API de login conforme documento
      const response = await appleLogin(loginData);

      if (!response.user_id) {
        throw new Error("No user ID received from Apple");
      }

      const userData = {
        id: response.user_id,
        email: response.email || "",
        username: "",
        is_active: true,
        is_verified: true,
        hashed_password: "",
        created_at: new Date().toISOString(),
        updated_at: "2019-08-24T14:15:22Z" as const,
      };

      // Armazenar usuário e tokens
      await setUserAndTokenFully(userData, response.access_token, response.refresh_token);

      showSuccess(`Welcome! Logged in as ${response.name || response.email}`);

      if (response.has_username) {
        router.replace("/home");
      } else {
        router.replace("/set-username");
      }
    } catch (e: any) {
      console.log("Handle Apple Login Error: ", e);
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        // Usuário cancelou - não mostrar erro
        return;
      }

      const message = e?.message || "Apple login failed. Try again.";
      showError(`Login failed: ${message}`);
      console.error("Apple login error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFacebookLogin() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://dev1.auth.growzone.co/api/v1/instagram/oauth-url-public"
      );
      const { authorization_url } = response.data;
      showSuccess("Redirecting to Facebook...");
      Linking.openURL(authorization_url);
    } catch (error) {
      showError("Failed to initiate Facebook login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={["top"]}>
        <Loader isLoading={isLoadingUserStorage} />
        <View className="bg-black-100 w-full flex items-center justify-center h-full px-6">
          <View className="flex items-center justify-center gap-6 my-10">
            <Image
              source={images.logoGreen}
              className="w-[250px] h-10"
              resizeMode="contain"
            />

            <View className="flex gap-2">
              <Text className="text-3xl font-semibold text-white text-center">
                Join the Growzone community
              </Text>
              <Text className="text-lg font-regular text-black-30 text-center">
                Connect, learn, and grow in the cannabis culture!
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
            <Text className="text-white text-lg font-medium text-center">
              Continue with Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFacebookLogin}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading || isLoadingUserStorage}
          >
            <FontAwesome name="facebook" size={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">
              Continue with Facebook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAppleLogin}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading || isLoadingUserStorage}
          >
            <FontAwesome name="apple" size={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <Divider text="Or" />

          <View className="flex flex-col justify-center w-full gap-2">
            <Text className="text-center text-lg text-gray-100 font-medium">
              Don’t have an account?
            </Text>
            <Button
              variant="outline"
              handlePress={() => router.push("/sign-up")}
              containerStyles="mt-6"
              title="Create now"
              rightIcon={ArrowRight}
              isDisabled={isLoading || isLoadingUserStorage}
            />
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default Welcome;
