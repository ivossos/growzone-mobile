import { Image, StyleSheet, Text, Pressable, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { SocialPost } from "@/api/@types/models";
import { router } from "expo-router";
import { getMuxThumbnailUrl } from "@/lib/utils";
import { useCallback } from "react";

export default function ReelsCard(item: SocialPost) {
    const { width: screenWidth } = useWindowDimensions();
    const cardWidth = screenWidth * 0.42; // 40% da largura da tela
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

  const handlerPress = useCallback(() => {
    router.push({
      pathname: "/post/[id]/reels",
      params: { id: item.post_id },
    });
  }, [item]);

  return (
    <Pressable
      onPress={handlerPress}
      style={{ width: cardWidth }}
      className="flex bg-black-100 border border-black-90 rounded-lg shadow-lg overflow-hidden"
    >
      <Image
        source={{ uri: getMuxThumbnailUrl(item?.file?.file) }}
        className="w-full h-64 rounded-lg"
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.20)", "rgba(255, 255, 255, 0.20)"]}
        style={styles.blurContainer}
      >
        <Eye size={14} color={colors.brand.white} />
        <Text className="text-white text-base font-medium">
          {item.view_count}
        </Text>
      </LinearGradient>
    </Pressable>
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
