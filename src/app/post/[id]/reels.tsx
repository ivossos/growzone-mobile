import { ReelsDetail } from "@/api/@types/models";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import ReelsPost from "@/components/ui/reels-post";
import { colors } from "@/styles/colors";
import { ChevronLeft } from "lucide-react-native";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { View, StyleSheet, Platform, TouchableOpacity, StatusBar, Dimensions } from "react-native";
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
      const playerKey = `${post?.id}-0`; 
      const player = playerRefs.current.get(playerKey);

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
    <View style={{ backgroundColor: colors.black[100], flex: 1 }}>
      <StatusBar translucent backgroundColor={"transparent"} />

      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <View className="flex flex-row items-center justify-between h-[72px] px-6">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              className="p-2 rounded-lg border border-brand-white"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.16)",
                borderRadius: 8,
                padding: 8,
              }}
              onPress={handlerGoBack}
            >
              <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
            </TouchableOpacity>
            <LogoIcon width={107} heigth={11} />
          </View>
        </View>
      </SafeAreaView>
      <View style={{ flex: 1}}>

      {post && (
        <ReelsPost
          videoId={post.id}
          playerRef={playerRefs}
          uri={post.file.file}
          post={post}
          isVisible
          type="reelsCard"
          videoContainer={{ flex: 1 }}
        />
      )}
    </View>
    </View>
  );
}
