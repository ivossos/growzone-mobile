import { getGrowPost } from "@/api/social/post/get-grow-post";
import GrowPostCard from "@/components/ui/grow-post-card";
import { colors } from "@/styles/colors";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Loader from "@/components/ui/loader";
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
  const playerRefs = useRef(new Map());
  const { id } = (params as { id: string }) || {};

  const { data, isLoading, error } = useQuery({
    queryKey: ["grow-post-data", id],
    queryFn: async () => {
      const numberId = Number(id);
      const [post] = await Promise.all([getGrowPost(numberId)]);
      return { post };
    },
    enabled: !!id,
  });

  const handlerGoBack = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["grow-post-data", id] });
    router.back();
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["grow-post-data", id] });
    };
  }, [id]);

  if (error) {
    showErrorToast(
      "Aconteceu um erro ao buscar as informações. Tente novamente mais tarde."
    );
    router.back();
  }
  useFocusEffect(
    useCallback(() => {
      const player = playerRefs.current.get(data?.post.post_id);

      if (player) {
        player.play();
      }

      return () => {
        playerRefs.current.forEach((player) => player.pause());
      };
    }, [data])
  );
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
          {post && <GrowPostCard playerRef={playerRefs} post={post} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
