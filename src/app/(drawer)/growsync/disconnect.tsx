import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import { screens } from "@/constants/screens";
import { router } from "expo-router";
import { ArrowLeft, Copy, ChevronRight } from "lucide-react-native";
import { useState } from "react";

export default function GrowsyncDisconnect() {
  const navigation = useNavigation();
  const { title, Icon } = screens["growsync"];
  const [isConnected, setIsConnected] = useState(true);

  function handleBack() {
    navigation.goBack();
  }

  function handleImport() {
    router.push("/growsync/import-post");
  }

 function toggleSwitch() {
  const newValue = !isConnected;
  setIsConnected(newValue);

  if (!newValue) {
    console.log("Desconectando e redirecionando para configurações...");
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  }
}


  return (
    <SafeAreaView className="flex-1 bg-black-100 px-6">
      <View className="flex flex-row items-center gap-4 h-[72px] border-b-[1px] border-black-80">
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
        </TouchableOpacity>
        <View className="flex flex-row items-center gap-2">
          <Icon width={20} height={20} />
          <Text className="text-white text-base font-semibold">{title}</Text>
        </View>
      </View>

      <View className="mt-8">
        <TouchableOpacity
          className="mt-8"
          onPress={handleImport}
        >
          <View className="flex flex-row items-center justify-between px-4 py-4 bg-black-90 rounded-lg">
            <View className="flex flex-row items-center gap-4">
              <Copy size={24} color="white" />
              <Text className="text-white text-base font-medium">Post</Text>
            </View>
            <ChevronRight className="rotate-180" color={colors.black[60]} size={16} />
          </View>
        </TouchableOpacity>

        <View className="flex flex-row items-center justify-between mt-9 px-4">
          <Text className="text-white text-base font-medium">
            Disconnect Instagram account
          </Text>
          <Switch
            value={isConnected}
            onValueChange={toggleSwitch}
            trackColor={{ false: colors.black[70], true: "#32CD32" }}
            thumbColor={"#ffffff"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
