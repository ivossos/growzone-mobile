import { ReelsDetail } from "@/api/@types/models";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import ReelsPost from "@/components/ui/reels-post";
import { colors } from "@/styles/colors";
import { ChevronLeft } from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getReel } from "@/api/social/post/get-reel";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import Loader from "@/components/ui/loader";

export default function Reels() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const playerRefs = useRef(new Map());

  const {
    data: post,
    isError,
    isLoading,
    error,
  } = useQuery<ReelsDetail>({
    queryKey: ["reels", postId],
    queryFn: async () => {
      const weedz = await getReel(postId);
      return weedz;
    },
    enabled: !!postId,
  });

  const handlerGoBack = useCallback(() => {
    router.back();
  }, []);

  if (isError) {
    console.error("Error on get reels", error);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao buscar as informações desse post. Tente novamente mais tarde.",
    });
    router.back();
  }

  useFocusEffect(
    useCallback(() => {
      const player = playerRefs.current.get(post?.id);

      if (player) {
        player.play();
      }

      return () => {
        playerRefs.current.forEach((player) => player.pause());
      };
    }, [post])
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100" edges={["top"]}>
      <StatusBar translucent backgroundColor={"transparent"} />
      <View style={styles.header}>
        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity
            className="p-2 rounded-lg border border-brand-white"
            style={styles.button}
            onPress={handlerGoBack}
          >
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={107} heigth={11} />
        </View>
      </View>

      {post && (
        <ReelsPost
          videoId={post.id}
          playerRef={playerRefs}
          uri={post.file.file}
          post={post}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    padding: 16,
    top: Platform.OS === "android" ? 30 : 50,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  button: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 8,
    padding: 8,
  },
});
