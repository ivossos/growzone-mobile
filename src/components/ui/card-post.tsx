import { Text, View } from "react-native";
import { Avatar, AvatarImage } from "../Avatar";
import { Ellipsis, EllipsisIcon } from "lucide-react-native";
import { colors } from "@/styles/colors";

export function CardPost() {

  return (
    <View className=" m-6"> 
      <View className="flex flex-row items-center justify-between gap-2 w-full">
        <View className="flex flex-row items-center gap-2 ">
          <Avatar className="w-14 h-14 border border-black-90 p-1">
            <AvatarImage
              className="rounded-full"
              source={require('@/assets/images/profile2.png')}
            />
          </Avatar>
          <Text
            className="text-white text-sm text-center font-semibold"

          >
            Pedro Oliveira
          </Text>
        </View>

        <View className="flex flex-row items-center gap-2">
          <Text className="text-brand-grey text-sm">10h</Text>
          <EllipsisIcon width={20} height={20} color={colors.brand.grey}/>
        </View>

      </View>

    </View>
  )
}