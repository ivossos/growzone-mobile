import { Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { screens } from "@/constants/screens";
import Button from "@/components/ui/button";
import GrowzoneIcon from "@/assets/icons/app.svg";
import InstagramIcon from "@/assets/icons/instagram.svg";
import { Linking } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/axios";
import { showSuccess, showError } from "@/utils/toast";

export default function Growsync() {
  const navigation = useNavigation();
  const { title, Icon } = screens["growsync"];
  const { token } = useAuth();

  function handleNavigation() {
    navigation.goBack();
  }

  async function handleConnect() {
    if (!token) {
      showError("Você precisa estar autenticado.");
      router.push("/sign-in");
      return;
    }

    try {
      const { data } = await authApi.get("/instagram/oauth-url", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const url: string | undefined = data?.authorization_url;
      if (!url) throw new Error("authorization_url não retornada pela API.");

      showSuccess("Redirecionando para o Facebook…");
      Linking.openURL(url);
    } catch (err: any) {
      showError(
        err?.response?.data?.detail ||
          err?.message ||
          "Não foi possível iniciar a conexão com o Instagram."
      );
    }
  }

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView className="flex-1">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={handleNavigation}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <View className="flex flex-row items-center gap-2">
            <Icon width={20} height={20} />
            <Text className="text-white text-base font-semibold">{title}</Text>
          </View>
        </View>

        <View className="px-6 mb-4 mt-6">
          <Text className="text-white text-base font-semibold">
            Connect your Instagram Business account to automatically import your posts and integrate them into your Growzone. With Growsync, your profile stays constantly updated with the latest content from your Instagram.
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center justify-center bg-primary px-2 py-2 rounded-lg gap-2">
            <Text className="text-black text-sm text-center font-bold">
              Request Business Account
            </Text>
          </View>
          <View className="flex flex-row items-center justify-center bg-black-80 px-6 py-6 my-8 rounded-lg gap-6">
            <GrowzoneIcon width={36} height={36} />
            <Text className="text-primary text-2xl">⇄</Text>
            <InstagramIcon width={36} height={36} />
          </View>
        </View>

        <View className="px-6 pb-6">
          <Button
            title="Connect"
            containerStyles="w-full"
            handlePress={handleConnect}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
