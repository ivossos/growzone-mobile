import { useState } from "react";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity } from "react-native";
import images from "@/constants/images";

import Button from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react-native";
import Divider from "@/components/ui/divider";
import { colors } from "@/styles/colors";
import { useAuth } from "@/hooks/use-auth";
import Loader from "@/components/ui/loader";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { FontAwesome } from "@expo/vector-icons";

const Welcome = () => {
  const { user, signIn, isLoadingUserStorage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user?.id && !isLoadingUserStorage) return <Redirect href="/home" />;

  async function submit() {
    try {
      setIsLoading(true);
      await signIn("edugrower", "Growzone10@");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Oops",
        text2: "Unable to log in...",
      });
      return;
    } finally {
      setIsLoading(false);
    }

    router.replace("/home");
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
            onPress={() => router.push("/sign-in")}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading}
          >
            <Mail width={24} height={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">
              Continue with Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/sign-in")}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            disabled={isLoading}
          >
            <FontAwesome name="facebook" size={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">
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
              isDisabled={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default Welcome;
