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
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Post() {
  const params = useLocalSearchParams<{ id: string }>();
  const postId = Number(params.id);

  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingPostComments, setIsLoadingPostComments] = useState(false);
  const [isLoadingPostLikes, setIsLoadingPostLikes] = useState(false);
  const [post, setPost] = useState<PostDetail>();
  const playerRef = useRef(new Map<string, any>());
  const lastsPostsCarrocelIndex = useRef<{ [postId: number]: number }>({});
  const activePost = useRef<number | null>(null);

  const fetchPost = async () => {
    try {
      setIsLoadingPost(true);
      const data = await getPost(postId);
      setPost(data);
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

  const handleVideoChange = useCallback((postId: number, videoIndex: number) => {
    const newPlayerKey = `${postId}-${videoIndex}`;
    const lastPlayerKey = `${activePost.current}-${videoIndex}`;

    if (newPlayerKey !== lastPlayerKey) {
      const lastPlayer = playerRef.current.get(lastPlayerKey);
      if (lastPlayer) {
        lastPlayer.pause();
      }

      const newPlayer = playerRef.current.get(newPlayerKey);
      if (newPlayer) {
        newPlayer.play();
      }

      activePost.current = postId;
    }
  }, []);

  useEffect(() => {
    if (post) {
      lastsPostsCarrocelIndex.current[post.post_id] = 0;
    }
  }, [post]);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      if (post) {
        const videoIndex = lastsPostsCarrocelIndex.current[post.post_id] ?? 0;
        handleVideoChange(post.post_id, videoIndex);
      }

      return () => {
        playerRef.current.forEach((player, key) => {
          player.pause();
        });
      };
    }, [post, handleVideoChange])
  );

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
                playerRef={playerRef} 
                post={post}
                isVisible={activePost.current === post.post_id}
                onVideoChange={handleVideoChange}  
              />
            )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
