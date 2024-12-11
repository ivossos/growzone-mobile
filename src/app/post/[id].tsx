import { Comment, PostDetail, PostLike } from "@/api/@types/models";
import PostCard from "@/components/ui/post-card";
import { useActivePostHome } from "@/hooks/use-active-post-home";
import { colors } from "@/styles/colors";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useEffect } from "react";
import { getPost } from "@/api/social/post/get-post";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { getPostLikes } from "@/api/social/post/like/get-likes";
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
  const { id } = (params as { id: number }) || {};
  const { handlePostChange } = useActivePostHome();

  const { data, isLoading, error } = useQuery({
    queryKey: ["post-data", id],
    queryFn: async () => {
      const [post, comments, likes] = await Promise.all([
        getPost(id),
        getPostComments({ postId: id, skip: 0, limit: 4 }),
        getPostLikes({ postId: id, skip: 0, limit: 4 }),
      ]);
      return { post, comments, likes };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.post) {
      handlePostChange(data.post.post_id);
    }
  }, [data, handlePostChange]);

  if (error) {
    showErrorToast("Aconteceu um erro ao buscar as informações. Tente novamente mais tarde.");
    router.back();
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

  const { post, comments = [], likes = [] } = data || {};

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <PostHeader onBack={() => router.back()} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {post && <PostCard post={post} comments={comments} likes={likes} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
