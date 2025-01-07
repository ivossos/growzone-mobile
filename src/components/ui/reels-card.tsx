import { Image, StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { SocialPost } from "@/api/@types/models";
import { Link } from "expo-router";
import { replaceMediaUrl } from "@/lib/utils";
import { TimelineType } from "@/api/@types/enums";

export default function ReelsCard(item: SocialPost) {
  // const videoRef = useRef<(Video | null)>(null);

  // useEffect(() => {
  //   return () => {
  //     const releaseVideo = async () => {
  //       if (videoRef.current) {
  //         await videoRef.current.pauseAsync();
  //         await videoRef.current.unloadAsync();
  //       }
  //     };

  //     releaseVideo().catch(error => console.error("Erro ao liberar o vídeo:", error));
  //   };
  // }, []);

  return (
    // timeline
    <Link
      href={{
        pathname: "/post/[id]/reels",
        params: {
          id: item.post_id,
        },
      }}
    >
      <View className="flex flex-col gap-2 w-[155px]">
        <Image
          source={{ uri: replaceMediaUrl(item?.file?.file) }}
          className="rounded-t-2xl"
          style={{
            height: 224,
            width: 155,
          }}
          resizeMode="cover"
        />
        {/* <Video
            ref={ref => (videoRef.current = ref)} 
            source={{ uri: item?.file?.file}}
            className="rounded-t-2xl"
            style={{
              height: 224, 
              width: 155
            }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping
            useNativeControls={false}
          /> */}
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.20)", "rgba(255, 255, 255, 0.20)"]}
          style={styles.blurContainer}
        >
          <Eye size={14} color={colors.brand.white} />
          <Text className="text-white text-base font-medium">
            {item.view_count}
          </Text>
        </LinearGradient>
        {/* <View className="flex flex-col gap-1">
            <Text
              className="text-base text-brand-grey font-normal"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ width: 224 }}
              >
                {item.description}
            </Text>
            <View className="flex flex-row items-center gap-2">
              <Avatar className="w-6 h-6 bg-black-60">
                {!!(item..image?.image) && <AvatarImage
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
            </View>
          </View> */}
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
});
