import { PostCard } from "@/components/ui/post-card";
import { postsMock } from "@/constants/mock";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Post() {
  const post = postsMock[2]
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View className="flex-1 bg-black-100 overflow-hidden">
      <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
        </TouchableOpacity>
        <Text className="text-white text-base font-semibold">
          Publicação
        </Text>
      </View>
    <PostCard post={post}/>
    </View>
    </SafeAreaView>
  )
}