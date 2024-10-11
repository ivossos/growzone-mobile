import { postsMock } from "@/constants/mock";
import { FlatList, Image, StyleSheet, View, Dimensions, Text, TouchableOpacity } from "react-native";
import { Post } from "./post-card";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { LinearGradient } from "expo-linear-gradient";
import { Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { SocialPost } from "@/api/@types/models";
import { Video } from "expo-av";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { router } from "expo-router";


const numColumns = 2;
const w = Dimensions.get("window").width;

type ReelsGridProps = {
  reels: SocialPost[]
}

export default function ReelsGrid({ reels }: ReelsGridProps) {
  const { user} = useAuth();

  const renderItem = ({ item }: { item: SocialPost}) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/reels/${item.post_id}`)} className="flex flex-col gap-2 mb-4">
         <Video
          source={{ uri: item?.file?.file}}
          style={styles.image}
          shouldPlay={false}
          isLooping
          useNativeControls={false}
        />
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
          style={styles.blurContainer}
        >
          <Eye size={18} color={colors.brand.white}/>
          <Text className="text-white text-base font-medium">{item.view_count}</Text>
        </LinearGradient>
        <View className="flex flex-col gap-1">
          {item.description && <Text
            className="text-base text-brand-grey font-normal"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.description}
            >
              {item.description}
          </Text>}
          {/* <View className="flex flex-row items-center gap-2">
            <Avatar className="w-6 h-6 bg-black-60">
              {!!(user.image?.image) && <AvatarImage
                className="rounded-full"
                source={{ uri: user.image?.image}}
              />}
              <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
            </Avatar>
            <Text 
              className="text-white text-sm text-start font-semibold" 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
                {user?.name || user?.username}
              </Text>
          </View> */}

        </View>
      </TouchableOpacity>
    )
};

  return (
    <FlatList
      data={reels.filter(r => !r.is_compressing)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperClassName="flex gap-4 px-6 w-full"
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 24,
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns ,
  },
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
