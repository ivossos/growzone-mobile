import { Comment, GrowPostDetail, PostDetail, PostLike, SocialPost } from "@/api/@types/models";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { getGrowPost } from "@/api/social/post/get-grow-post";
import { getPost } from "@/api/social/post/get-post";
import { getPostLikes } from "@/api/social/post/like/get-likes";
import GrowPostCard from "@/components/ui/grow-post-card";
import PostCard from "@/components/ui/post-card";
import { useActivePostHome } from "@/hooks/use-active-post-home";
import { colors } from "@/styles/colors";
import { useRoute } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Post() {
  const params = useLocalSearchParams();
  const { id } = (params  as { id: number }) || {};
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingPostComments, setIsLoadingPostComments] = useState(false);
  const [isLoadingPostLikes, setIsLoadingPostLikes] = useState(false);
  const [post, setPost] = useState<GrowPostDetail>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<PostLike[]>([]);

  const { handlePostChange } = useActivePostHome();

  const fetchPost = async () => {
    try {
      setIsLoadingPost(true);
      const data = await getGrowPost(id);
      setPost(data);
      handlePostChange(data.post_id);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.'
      });

      router.back();
    } finally {
      setIsLoadingPost(false);
    }
  };

  const fetchPostComments = async () => {
    try {
      setIsLoadingPostComments(true);
      const data = await getPostComments({ postId: id, skip: 0, limit: 4 });
      setComments(data);
    } catch (error) {

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.'
      });

      router.back();
      
    } finally {
      setIsLoadingPostComments(false);
    }
  }

  const fetchPostLikes = async () => {
    try {
      setIsLoadingPostLikes(true);
      const data = await getPostLikes({ postId: id, skip: 0, limit: 4  });
      setLikes(data);
    } catch (error) {

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.'
      });

      router.back();
      
    } finally {
      setIsLoadingPostLikes(false);
    }
  }

  useEffect(() => {
    fetchPost();
    fetchPostLikes();
    fetchPostComments();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View className="flex-1 bg-black-100 overflow-hidden">
      <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
        </TouchableOpacity>
        <View className="flex flex-col justify-center items-center mx-auto">
          <Text className="text-brand-green text-base font-semibold">
            Plantas
          </Text>
          {post?.user && <Text className="text-black-60 text-base font-semibold">
            {post?.user?.name || post?.user.username}
          </Text>}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isLoadingPost && !isLoadingPostComments && !isLoadingPostLikes && (
          post && <GrowPostCard post={post} comments={comments} likes={likes} />
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  )
}