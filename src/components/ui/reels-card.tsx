import { Image, StyleSheet, View, Text } from "react-native";
import { Post } from "./post-card";
import { Avatar, AvatarImage } from "../Avatar";
import { LinearGradient } from "expo-linear-gradient";
import { Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";

export default function ReelsCard( item: Post) {
  const image = item?.media?.find(m => m.type === 'image');
    
  if(!image) return;

  return (
    <View className="flex flex-col gap-2 w-[155px]">
        <Image height={224} width={155} source={{ uri: image.file! }} resizeMode="cover" className="rounded-t-2xl" />
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
          style={styles.blurContainer}
        >
          <Eye size={18} color={colors.brand.white}/>
          <Text className="text-white text-base font-medium">75</Text>
        </LinearGradient>
        <View className="flex flex-col gap-1">
          <Text
            className="text-base text-brand-grey font-normal"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ width: 224 }}
            >
              {item.content}
          </Text>
          <View className="flex flex-row items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                className="rounded-full"
                src={item?.user_info?.avatar!}
              />
            </Avatar>
            <Text 
              className="text-white text-sm text-start font-semibold" 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
                {item?.user_info?.name}
              </Text>
          </View>

        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16, 
    elevation: 4,
  },
});