import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions, TouchableOpacity, Platform, Dimensions } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { MessageCircleMore } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Link, router, useFocusEffect } from "expo-router";
import ExpandableText from "./expandable-text";
import { ReelsDetail } from "@/api/@types/models";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import Toast from "react-native-toast-message";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createLike } from "@/api/social/post/like/create-like";
import { deleteLike } from "@/api/social/post/like/delete-like";
import LikeIcon from "@/assets/icons/like-white.svg";
import LikedIcon from "@/assets/icons/liked.svg";
import { createView } from "@/api/social/post/view/create-view";
import { debounce } from "lodash";

type ReelsPostProps = {
  post: ReelsDetail;
  activePostId: number;
  resizeMode?: ResizeMode
};

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const ReelsPost = ({ post, activePostId, resizeMode = ResizeMode.CONTAIN }: ReelsPostProps) => {
  const { user } = useAuth();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [follow, setFollow] = useState<boolean>(post.user.is_following);
  const [liked, setLiked] = useState(post.is_liked);
  const [likedCount, setLikedCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);
  const [isViewed, setIsViewed] = useState(post.is_viewed);
  const { openBottomSheet } = useBottomSheetContext();
  
  const isPlaying = status?.isLoaded && status.isPlaying;
  const isBuffering = status?.isLoaded && status.isBuffering;


  const handleBottomSheet = (postId: any) => {
    openBottomSheet({ type: 'comment', id: postId, callbackFn: async (increment) => {
      if(typeof increment === 'boolean') {
        setCommentCount(prev => prev += 1);
      }
    }});
  };

  const handleFollower = async () => {
    try {
      setIsLoadingHandleFollower(true);
      if (follow) {
        await deleteFollow(post.user.id);
        setFollow(false);
      } else {
        await createFollow(post.user.id);
        setFollow(true);
      }
    } catch (error) {
      console.error("Erro ao gerenciar seguidor:", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: 'Ocorreu um erro ao realizar essa ação. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  };

  const viewVideo = async (post: ReelsDetail)  => {
    try {
      if (!isViewed) {
        await createView(post.post_id);
        setIsViewed(true);
      }
    } catch (err) {
      console.error("Erro marcar video como visto:", err);
    }
  }

  const handleLike = async () => {
    try {
      setIsLoadingLiked(true);
      if (liked) {
        await deleteLike(post.post_id);
        setLiked(false);
        setLikedCount(prev => prev - 1);
      } else {
        await createLike(post.post_id);
        setLiked(true);
        setLikedCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Erro ao gerenciar like:", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: `Ocorreu um erro ao ${liked ? "remover like" : "dar like"} no post. Tente novamente mais tarde.`,
      });
    } finally {
      setIsLoadingLiked(false);
    }
  };

  const restartPlayback = useCallback(async () => {
    if (video.current) {
      await video.current.unloadAsync();
      await video.current.loadAsync({ uri: post.file.file }, { shouldPlay: true });
    }
  }, [post.file.file]);

  const handlePlaybackError = (error: any) => {
    console.log('error', error)
    if (error?.domain === 'AVFoundationErrorDomain' && error?.code === -11819) {
      console.log('error if')
      restartPlayback();
    }
  };

  const managePlayback = async () => {
    if (video.current) {
      try {
        if (activePostId === post.post_id) {
          await video.current.loadAsync({ uri: post.file.file }, { shouldPlay: true });
          await viewVideo(post);
        } else {
          await video.current.pauseAsync();
          await video.current.unloadAsync();
        }
      } catch (error) {
        console.error("Erro ao gerenciar a reprodução:", error);
      }
    }
  };
  
  const debouncedManagePlayback = useCallback(
    debounce(managePlayback, 300),
    [activePostId, post.post_id]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (video.current) {
          video.current.pauseAsync().catch(error => console.error("Erro ao parar o vídeo:", error));
        }
      };
    }, [])
  );

  useEffect(() => {
    if (!video.current) return;
  
    debouncedManagePlayback();
  
    return () => {
      debouncedManagePlayback.cancel();
    };
  }, [activePostId, post.post_id]);

  const onPress = async () => {
    if (!video.current) return;

    try {
      if (isPlaying) {
        await video.current.pauseAsync();
      } else {
        await video.current.playAsync();
      }
    } catch (error) {
      console.error("Erro ao alternar reprodução:", error);
    }
  };

  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets(); 
  const videoHeight = height - top - bottom;

  return (
    <View style={[styles.container, { height: videoHeight }]}>
      <Video
        ref={video}
        style={[StyleSheet.absoluteFill, styles.video]}
        source={{ uri: post.file.file }}
        resizeMode={resizeMode}
        onPlaybackStatusUpdate={setStatus}
        isLooping
        isMuted={false}
        onError={handlePlaybackError}
      />

      <Pressable onPress={onPress} style={styles.content}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={[StyleSheet.absoluteFillObject, styles.overlay]}
        />
        {!isPlaying && !isBuffering && (
          <Ionicons
            style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            name="play"
            size={70}
            color="rgba(255, 255, 255, 0.6)"
          />
        )}
        {isBuffering && (
          <ActivityIndicator
            style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            size="large"
            color="#FFFFFF"
          />
        )}
        
          <View style={styles.footer}>
            <View style={{ flex: 1 }} className="flex gap-2">
              <View
                key={post.user.id}
                className="flex flex-row items-center justify-start w-full"
              >
                <TouchableOpacity className="flex flex-row items-center gap-2 mr-2" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: post.user.id }})}>
                  <Avatar className="w-12 h-12 bg-black-80">
                  {!!(post.user.image?.image) &&
                    <AvatarImage
                      className="rounded-full"
                      src={post.user.image.image}
                    />}
                    <AvatarFallback>{getInitials(post.user?.name || post.user?.username)}</AvatarFallback>
                  </Avatar>
                  <View>
                    <Text className="text-white text-lg text-start font-semibold">
                      {post.user.name || post.user.username}
                    </Text>
                  </View>
                </TouchableOpacity>

                {(user.id !== post.user.id) && (post.user.is_following ? (
                  <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px]" onPress={handleFollower}>
                    {isLoadingHandleFollower && (
                      <ActivityIndicator
                        animating
                        color="#fff"
                        size="small"
                        className="ml-2"
                      />
                    )}
                    {!isLoadingHandleFollower && <Text className="text-base text-neutral-400">Seguindo</Text>}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px]" onPress={handleFollower}>
                    {isLoadingHandleFollower && (
                      <ActivityIndicator
                        animating
                        color="#fff"
                        size="small"
                        className="ml-2"
                      />
                    )}
                    {!isLoadingHandleFollower && <Text className="text-base text-brand-green ">
                      + Seguir
                    </Text>}
                  </TouchableOpacity>
                ))}
              </View>
              {post.description && <ExpandableText text={post.description} numberOfLines={1} />}
            </View>

            <View style={styles.rightColumn}>
              <View className="flex flex-col items-center justify-center gap-2">
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
                  style={styles.blurContainer}
                >
                  <TouchableOpacity onPress={handleLike}>
                  {liked ? (
                  <LikedIcon width={20} height={20} />
                ) : (
                  <LikeIcon width={20} height={20} />
                )}
                  </TouchableOpacity>
                </LinearGradient>
                {likedCount > 0 && (
                  <Link href={{ pathname: '/reels/[id]/likes', params: { id: post.post_id } }} >
                    <Text className="text-white font-medium">{likedCount}</Text>
                  </Link>
                )}
              </View>
              <View className="flex flex-col items-center justify-center gap-2">
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
                  style={styles.blurContainer}
                >
                  <TouchableOpacity onPress={() => handleBottomSheet(post.post_id)}>
                    <MessageCircleMore size={20} color={colors.brand.white} />
                  </TouchableOpacity>
                </LinearGradient>
                {commentCount > 0 && (
                  <Text className="text-white font-medium">{commentCount}</Text>
                )}
              </View>
            </View>
          </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    padding: 12,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  container: {
    flex: 1
  },
  video: {
    height: '100%'
  },
  content: {
    flex: 1,
    padding: 24,
  },
  overlay: {
    top: "50%",
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  rightColumn: {
    gap: 16,
  },
});

export default memo(ReelsPost);
