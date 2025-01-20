import { getGrowPost } from "@/api/social/post/get-grow-post";
import GrowPostCard from "@/components/ui/grow-post-card";
import { colors } from "@/styles/colors";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Loader from "@/components/ui/loader";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { createVideoPlayer, VideoPlayer } from "expo-video";
import { GrowPostDetail } from "@/api/@types/models";
import { queryClient } from "@/lib/react-query";

const showErrorToast = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Opss",
    text2: message,
  });
};

export default function Post() {
  const params = useLocalSearchParams();
  const { id } = (params as { id: string }) || {};
  const { toggleAudioMute, setPlayer, pauseVideo, clearPlayer } = useVideoPlayerContext();

  const [mutedVideo, setMutedVideo] = useState(false);

  const setPlayerValue = (post: GrowPostDetail) => {
    const [file] = post.files;

    if (file.type === "video") {
      setPlayer(file.player);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["grow-post-data", id],
    queryFn: async () => {
      const numberId = Number(id);
      const [post] = await Promise.all([getGrowPost(numberId)]);

      const filesMap = post.files.map((file, index) => {
        let player: undefined | VideoPlayer = undefined

        if (file.type === "video") {
          player = createVideoPlayer({
            uri: file.file,
            metadata: {
              title: `title-grow-${index}`,
              artist: `artist-grow-${index}`,
            },
          });

          player.loop = true;
          player.muted = false;
          player.timeUpdateEventInterval = 2;
          player.volume = 1.0;
        }

        return {
          ...file,
          player,
        };
      });

      post.files = filesMap as any;

      setPlayerValue(post);

      return { post };
    },
    enabled: !!id,
  });

  const handlerGoBack = useCallback(() => {
    pauseVideo();
    setPlayer(undefined);
    queryClient.removeQueries({ queryKey: ['grow-post-data', id] })
    router.back();
  }, []);

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;
    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo, setMutedVideo]);

  useEffect(() => {
    if (data?.post) {
      const [player] = data.post.files
      if (player && player.type === 'video') {
        setPlayer(player.player);
      }
    }
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['grow-post-data', id] });
    };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        pauseVideo();
        clearPlayer();
      };
    }, [])
  );

  if (error) {
    showErrorToast(
      "Aconteceu um erro ao buscar as informações. Tente novamente mais tarde."
    );
    router.back();
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

  const { post } = data || {};

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={handlerGoBack}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <View className="flex flex-col justify-center items-center mx-auto">
            <Text className="text-brand-green text-base font-semibold">
              Plantas
            </Text>
            {post?.user && (
              <Text className="text-black-60 text-base font-semibold">
                {post?.user?.name || post?.user.username}
              </Text>
            )}
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {post && (
            <GrowPostCard
              handlerAudioMute={handlerMutedVideo}
              audioMute={mutedVideo}
              post={post}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
