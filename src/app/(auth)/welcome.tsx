import { useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Mail } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";

import images from "@/constants/images";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/axios";
import { showSuccess, showError } from "@/utils/toast";

import Button from "@/components/ui/button";
import Divider from "@/components/ui/divider";
import Loader from "@/components/ui/loader";
import { colors } from "@/styles/colors";

export default function Welcome() {
  const { user, isLoadingUserStorage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user?.id && !isLoadingUserStorage) {
    return <Redirect href="/home" />;
  }

  const handleEmailLogin = () => {
    router.push("/sign-in");
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
    
      const res = await authApi.get("/instagram/oauth-url");
      const { authorization_url } = res.data || {};

      if (!authorization_url) {
        throw new Error("Authorization URL not returned by backend");
      }

      showSuccess("Redirecting to Facebook…");
      await Linking.openURL(authorization_url);

    } catch (err: any) {
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
            <Text className="text-white text-lg font-medium">
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
            <Text className="text-white text-lg font-medium">
              Continue with Facebook
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
}
