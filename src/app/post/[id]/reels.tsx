import { ReelsDetail } from "@/api/@types/models";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import ReelsPost from "@/components/ui/reels-post";
import { colors } from "@/styles/colors";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { Dimensions, Platform, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getReel } from "@/api/social/post/get-reel";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { createVideoPlayer, VideoPlayer } from "expo-video";
import { queryClient } from "@/lib/react-query";
import Loader from "@/components/ui/loader";

export default function Reels() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const { playVideo, toggleAudioMute, setPlayer, pauseVideo, clearPlayer } =
    useVideoPlayerContext();

  const [mutedVideo, setMutedVideo] = useState(false);

  const {
    data: post,
    isError,
    isLoading,
    error,
  } = useQuery<ReelsDetail>({
    queryKey: ["reels", postId],
    queryFn: async () => {
      const weedz = await getReel(postId);

      let player: VideoPlayer | undefined = undefined;

      if (weedz.file.type === "video") {
        player = createVideoPlayer({
          uri: weedz.file.file,
          metadata: {
            title: `title-weedz-${weedz.id}`,
            artist: `artist-weedz-${weedz.id}`,
          },
        });

        player.loop = true;
        player.muted = false;
        player.timeUpdateEventInterval = 2;
        player.volume = 1.0;
      }

      weedz.player = player as VideoPlayer;
      weedz.file.player = player as VideoPlayer;

      setPlayer(player);
      playVideo();

      return weedz;
    },
    enabled: !!postId,
  });

  const handlerGoBack = useCallback(() => {
    pauseVideo();
    setPlayer(undefined);
    //queryClient.removeQueries({ queryKey: ['reels', postId] })
    router.back();
  }, []);

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;
    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo, setMutedVideo]);

  if (isError) {
    console.error("Error on get reels", error);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao buscar as informações desse post. Tente novamente mais tarde.",
    });
    setPlayer(undefined);
    router.back();
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        pauseVideo();
        clearPlayer();
      };
    }, [])
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
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor={colors.black[100]} style="light" />

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
          {/* <TouchableOpacity>
          <Camera className="w-8 h-8" color={colors.brand.white} />
        </TouchableOpacity> */}
        </View>
      </SafeAreaView>
      <View style={{ flex: 1 }}>
        {post && (
          <ReelsPost
            post={post}
            video={{
              controls: {
                handlerMutedVideo,
                showProgressBar: false,
                showButtonPlay: true,
              },
              muted: mutedVideo,
              player: post.player,
            }}
            activePostId={postId}
          />
        )}
      </View>
    </View>
  );
}
