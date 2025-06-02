import { Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { screens } from "@/constants/screens";
import Button from "@/components/ui/button";
import GrowzoneIcon from "@/assets/icons/app.svg";
import InstagramIcon from "@/assets/icons/instagram.svg";

export default function Growsync() {
  const navigation = useNavigation();
  const { title, Icon } = screens["growsync"];

  function handleNavigation() {
    navigation.goBack();
  }

  function handleConnect() {
    router.push("/growsync/disconnect");
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
          <View className="flex flex-row items-center justify-center bg-black-80 px-6 py-6 my-20 rounded-lg gap-6">
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
