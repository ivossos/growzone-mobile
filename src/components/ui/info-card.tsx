import { colors } from "@/styles/colors";
import { Info } from "lucide-react-native";
import { Text, View } from "react-native";

export default function InfoCard({ description }: { description: string }) {
  return (
    <View className="flex flex-row items-center gap-2 px-6 py-4 rounded-lg bg-black-90">
      <Info size={24} color={colors.brand.yellow}/>
      <Text className="text-wrap text-sm text-brand-grey font-regular">{description}</Text>
    </View>
  )
}