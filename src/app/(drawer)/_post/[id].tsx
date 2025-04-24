import { Comment, PostDetail, PostLike, SocialPost } from "@/api/@types/models";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { getPost } from "@/api/social/post/get-post";
import { getPostLikes } from "@/api/social/post/like/get-likes";
import PostCard from "@/components/ui/post-card";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { colors } from "@/styles/colors";
import { useNavigationState, useRoute } from "@react-navigation/native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Post() {
  const params = useLocalSearchParams();
  const { id } = (params as { id: string }) || {};

  const { toggleAudioMute } = useVideoPlayerContext();

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [mutedAudio, setAudioMute] = useState(false);
  const [post, setPost] = useState<PostDetail>();
  const navigation = useNavigation();

  const fetchPost = async () => {
    try {
      setIsLoadingPost(true);
      const data = await getPost(Number(id));
      setPost(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handlerAudioMute = useCallback(async (value: boolean) => {
    toggleAudioMute(value);
    setAudioMute(value);
  }, []);

  useEffect(() => {
    fetchPost();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">Publicação</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!isLoadingPost && post && (
            <PostCard
              audioMute={mutedAudio}
              handlerAudioMute={handlerAudioMute}
              post={post}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
