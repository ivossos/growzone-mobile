import { Comment, ReelsDetail, PostLike, SocialPost } from "@/api/@types/models";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { getReels } from "@/api/social/post/get-reels";
import { getPostLikes } from "@/api/social/post/like/get-likes";
import { PostCard } from "@/components/ui/post-card";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import ReelsPost from "@/components/ui/reels-post";
import { colors } from "@/styles/colors";
import { useRoute } from "@react-navigation/native";
import { router, Stack, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Camera, ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";

export default function Reels() {
  const route = useRoute();
  const id = (route.params as { id: number })?.id;
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingPostComments, setIsLoadingPostComments] = useState(false);
  const [isLoadingPostLikes, setIsLoadingPostLikes] = useState(false);
  const [post, setPost] = useState<ReelsDetail>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<PostLike[]>([]);
  const navigation = useNavigation();
 
  const fetchPost = async () => {
    try {
      setIsLoadingPost(true);
      const data = await getReels(id);
      setPost(data);
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

  useEffect(() => {
    fetchPost();
  }, [id]);

  return (
    <View style={{  backgroundColor: colors.black[100], flex: 1 }}>
    <Stack.Screen options={{ headerShown: false }} />
    <StatusBar backgroundColor={colors.black[100]} style="light" />

    <SafeAreaView
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="flex flex-row items-center justify-between h-[72px] px-6">
        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity className="p-2 rounded-lg border border-brand-white" style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.16)', borderRadius: 8, padding: 8}}
            onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={107} heigth={11} />
        </View>
        <TouchableOpacity>
          <Camera className="w-8 h-8" color={colors.brand.white} />
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
    <View style={{ flex: 1 }}>
      {post && <ReelsPost post={post} activePostId={post.post_id} />}
    </View>
  </View>
  )
}