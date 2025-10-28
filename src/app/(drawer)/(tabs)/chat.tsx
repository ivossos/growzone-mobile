import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatTab() {
  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl font-semibold">
          Chat Em Breve
        </Text>
        <Text className="text-neutral-400 text-base mt-2">
          Funcionalidade em desenvolvimento
        </Text>
      </View>
    </SafeAreaView>
  );
}
