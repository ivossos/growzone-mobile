import { Comment, PostDetail, PostLike } from "@/api/@types/models";
import PostCard from "@/components/ui/post-card";
import { useActivePostHome } from "@/hooks/use-active-post-home";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/styles/colors";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getPost } from "@/api/social/post/get-post";
import Loader from "@/components/ui/loader";

const showErrorToast = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Opss",
    text2: message,
  });
};

const PostHeader = ({ onBack }: { onBack: () => void }) => (
  <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
    <TouchableOpacity onPress={onBack}>
      <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
    </TouchableOpacity>
    <Text className="text-white text-base font-semibold">Publicação</Text>
  </View>
);

export default function Post() {
  const params = useLocalSearchParams();
  const { id } = (params as { id: string }) || {};
  const playerRef = useRef(new Map<string, any>());
  const activePost = useRef<{ postId: number; index: number } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["post-data", id],
    queryFn: async () => {
      const postId = Number(id);
      const [post] = await Promise.all([getPost(postId)]);
      return { post };
    },
    enabled: !!id,
  });

  const handleVideoChange = useCallback((postId: number, videoIndex: number) => {
    const newPlayerKey = `${postId}-${videoIndex}`;
    const lastPlayerKey = `${activePost.current?.postId}-${activePost.current?.index}`;

    if (newPlayerKey !== lastPlayerKey) {
      const lastPlayer = playerRef.current.get(lastPlayerKey);
      if (lastPlayer) {
        lastPlayer.pause();
      }

      const newPlayer = playerRef.current.get(newPlayerKey);
      if (newPlayer) {
        newPlayer.play();
      } 

      activePost.current = { postId, index: videoIndex };

    }
  }, []);

  useEffect(() => {
    if (data?.post) {
      handleVideoChange(data.post.post_id, 0);
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      const currentPost = activePost.current;

      if (currentPost) {
        const playerKey = `${currentPost.postId}-${currentPost.index}`; 
        const currentPlayer = playerRef.current.get(playerKey);
        if (currentPlayer) {
          currentPlayer.play();
        }
      }

      return () => {
        playerRef.current.forEach((player, key) => {
          player.pause();
        });
      };
    }, [data])
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
        <PostHeader onBack={() => router.back()} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {post && (
            <PostCard
              playerRef={playerRef} 
              post={post} 
              isVisible={activePost.current?.postId === post.post_id}
              onVideoChange={handleVideoChange}  
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
