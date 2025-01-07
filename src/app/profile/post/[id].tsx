import { Comment, PostDetail, PostLike, SocialPost } from "@/api/@types/models";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { getPost } from "@/api/social/post/get-post";
import { getPostLikes } from "@/api/social/post/like/get-likes";
import PostCard from "@/components/ui/post-card";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { useActivePostHome } from "@/hooks/use-active-post-home";
import { colors } from "@/styles/colors";
import { useNavigationState, useRoute } from "@react-navigation/native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { createVideoPlayer } from "expo-video";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Post() {
  const params = useLocalSearchParams<{ id: string }>();
  const postId = Number(params.id);

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingPostComments, setIsLoadingPostComments] = useState(false);
  const [isLoadingPostLikes, setIsLoadingPostLikes] = useState(false);
  const [audioMute, setAudioMute] = useState(false);
  const [post, setPost] = useState<PostDetail>();
  const { toggleAudioMute, setPlayer } =
    useVideoPlayerContext();

  const mapPost = (data: PostDetail): PostDetail => {
    const files = data.files.map((file, index) => {
      const player = createVideoPlayer({
        uri: file.file,
        metadata: {
          title: `title-post-social-${index}`,
          artist: `artist-post-social-${index}`,
        },
      });

      player.loop = true;
      player.muted = false;
      player.timeUpdateEventInterval = 2;
      player.volume = 1.0;

      return {
        ...file,
        player,
      };
    });

    return {
      ...data,
      files,
    };
  };

  const setPlayerValue = (postData: PostDetail) => {
    const [file] = postData.files

    if (file.type === 'video') {
      setPlayer(file.player)
    }
  }
  

  const fetchPost = async () => {
    try {
      setIsLoadingPost(true);
      const data = await getPost(postId);
      const postData = mapPost(data);
      setPlayerValue(postData);
      setPost(postData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.',
      });

      router.back();
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handlerAudioMute = useCallback(async (value: boolean) => {
    toggleAudioMute(value);
    setAudioMute(value);
  }, []);

  const loadComments = async () => {
    await Promise.all([fetchPost()]);
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">Publicação</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!isLoadingPost &&
            !isLoadingPostComments &&
            !isLoadingPostLikes &&
            post && (
              <PostCard
                handlerAudioMute={handlerAudioMute}
                audioMute={audioMute}
                loadComments={loadComments}
                post={post}
              />
            )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
