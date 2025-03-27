import React, { useState, memo, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import {
  EllipsisIcon,
  MessageCircleMore,
  VolumeX,
  Volume2,
  Send,
} from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Link, router, useLocalSearchParams } from "expo-router";
import ExpandableText from "./expandable-text";
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
import { ReelsPostProps } from "../Types";
import VideoPlayer from "@/components/player/Video";
import { usePlayerContext } from "@/context/player-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createView } from "@/api/social/post/view/create-view";
import { ReelsDetail } from "@/api/@types/models";

import { GROWZONE_FRONTEND_URL } from "@/constants";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

const ReelsPost = ({
  post,
  videoId,
  playerRef,
  isVisible,
  uri,
  type,
  videoContainer,
}: ReelsPostProps) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [follow, setFollow] = useState<boolean>(post.user.is_following);
  const [liked, setLiked] = useState(post.is_liked);
  const [likedCount, setLikedCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);
  const [isViewed, setIsViewed] = useState(post.is_viewed);
  const { openBottomSheet } = useBottomSheetContext();
  const { isMuted, toggleMute } = usePlayerContext();

  const handleShareWeedz = async ({
    postId,
    userId,
  }: {
    postId: number;
    userId: number;
  }) => {
    try {
      const url = `${GROWZONE_FRONTEND_URL}/weedz/${userId}/${postId}`;
      await Share.share({
        title: url,
        message: url,
      });
    } catch (error) {}
  };

  const handleBottomSheet = (postId: any) => {
    openBottomSheet({
      type: "comment",
      id: postId,
      callbackFn: async (increment) => {
        if (typeof increment === "boolean") {
          setCommentCount((prev) => (prev += 1));
        }
      },
    });
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
        text2:
          "Ocorreu um erro ao realizar essa ação. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await deleteLike(post.post_id);
        setLiked(false);
        setLikedCount((prev) => prev - 1);
      } else {
        await createLike(post.post_id);
        setLiked(true);
        setLikedCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Erro ao gerenciar like:", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: `Ocorreu um erro ao ${
          liked ? "remover like" : "dar like"
        } no post. Tente novamente mais tarde.`,
      });
    }
  };

  const viewVideo = async (post: ReelsDetail) => {
    try {
      if (!isViewed) {
        await createView(post.post_id);
        setIsViewed(true);
      }
    } catch (err) {
      console.error("Erro marcar video como visto:", err);
      setIsViewed(true);
    }
  };

  const bottom = useMemo(() => {
    switch (type || params.type) {
      case "weedz":
        if (Platform.OS === "ios") {
          return {
            footer: 50,
            slider: 30,
          };
        }

        return {
          footer: 70,
          slider: 10,
        };

      case "reelsCard":
        if (Platform.OS === "ios") {
          return {
            footer: 50,
            slider: 30,
          };
        }

        return {
          footer: 40,
          slider: -40,
        };

      default:
        if (Platform.OS === "ios") {
          return {
            footer: 30,
            slider: 10,
          };
        }
        return {
          footer: 50,
          slider: 0,
        };
    }
  }, [params]);

  useEffect(() => {
    if (post) {
      viewVideo(post);
    }
  }, [post]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black[100] }}>
      <View style={[styles.videoPlayer, videoContainer]}>
        <VideoPlayer
          progressBar={false}
          uri={uri}
          videoId={videoId}
          playerRef={playerRef}
          progressBarBottom={bottom?.slider}
          isVisible={isVisible}
          index={0}
        />
      </View>
      <View
        style={[
          styles.footer,
          { bottom: Platform.OS === "ios" ? bottom?.footer : 20 },
        ]}
      >
        <View style={{ flex: 1 }} className="flex gap-2">
          <View
            key={post.user.id}
            className="flex flex-row items-center justify-start w-full"
          >
            <TouchableOpacity
              className="flex flex-row items-center gap-2 mr-2"
              onPress={() =>
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: post.user.id },
                })
              }
            >
              <Avatar className="w-12 h-12 bg-black-80">
                {!!post.user.image?.image && (
                  <AvatarImage
                    className="rounded-full"
                    src={post.user.image.image}
                  />
                )}
                <AvatarFallback>
                  {getInitials(post.user?.name || post.user?.username)}
                </AvatarFallback>
              </Avatar>
              <View>
                <Text className="text-white text-lg text-start font-semibold">
                  {post.user.name || post.user.username}
                </Text>
              </View>
            </TouchableOpacity>

            {user.id !== post.user.id &&
              (follow ? (
                <TouchableOpacity
                  className="px-3 py-1 bg-black-80 rounded-[64px]"
                  onPress={handleFollower}
                >
                  {isLoadingHandleFollower && (
                    <ActivityIndicator
                      animating
                      color="#fff"
                      size="small"
                      className="ml-2"
                    />
                  )}
                  {!isLoadingHandleFollower && (
                    <Text className="text-base text-neutral-400">Seguindo</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="px-3 py-1 border border-brand-green rounded-[64px]"
                  onPress={handleFollower}
                >
                  {isLoadingHandleFollower && (
                    <ActivityIndicator
                      animating
                      color="#fff"
                      size="small"
                      className="ml-2"
                    />
                  )}
                  {!isLoadingHandleFollower && (
                    <Text className="text-base text-brand-green ">
                      + Seguir
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
          {post.description && (
            <ExpandableText text={post.description} numberOfLines={1} />
          )}
        </View>

        <View style={styles.rightColumn}>
          <View className="flex flex-col items-center justify-center gap-2">
            <TouchableOpacity onPress={handleLike}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.16)",
                  "rgba(255, 255, 255, 0.32)",
                ]}
                style={styles.blurContainer}
              >
                {liked ? (
                  <LikedIcon width={20} height={20} />
                ) : (
                  <LikeIcon width={20} height={20} />
                )}
              </LinearGradient>
            </TouchableOpacity>
            {likedCount > 0 && (
              <Link
                href={{
                  pathname: "/reels/[id]/likes",
                  params: { id: post.post_id },
                }}
              >
                <Text className="text-white font-medium">{likedCount}</Text>
              </Link>
            )}
          </View>

          <View className="flex flex-col items-center justify-center gap-2">
            <TouchableOpacity onPress={() => handleBottomSheet(post.post_id)}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.16)",
                  "rgba(255, 255, 255, 0.32)",
                ]}
                style={styles.blurContainer}
              >
                <MessageCircleMore size={20} color={colors.brand.white} />
              </LinearGradient>
            </TouchableOpacity>
            {commentCount > 0 && (
              <Text className="text-white font-medium">{commentCount}</Text>
            )}
          </View>

          <View className="flex flex-col items-center justify-center gap-2">
            <TouchableOpacity
              onPress={() =>
                handleShareWeedz({
                  postId: post.post_id,
                  userId: post.user.id,
                })
              }
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.16)",
                  "rgba(255, 255, 255, 0.32)",
                ]}
                style={styles.blurContainer}
              >
                <Send size={20} color={colors.brand.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="flex flex-col items-center justify-center gap-2">
            <TouchableOpacity onPress={toggleMute}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.16)",
                  "rgba(255, 255, 255, 0.32)",
                ]}
                style={styles.blurContainer}
              >
                {isMuted ? (
                  <VolumeX size={20} color={colors.brand.white} />
                ) : (
                  <Volume2 size={20} color={colors.brand.white} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {user.id !== post.user.id && (
            <View className="flex flex-col items-center justify-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  openBottomSheet({ type: "report", id: post.post_id })
                }
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.16)",
                    "rgba(255, 255, 255, 0.32)",
                  ]}
                  style={styles.blurContainer}
                >
                  <EllipsisIcon size={20} color={colors.brand.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          {user.id === post.user.id && (
            <View className="flex flex-col items-center justify-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  openBottomSheet({
                    type: "reel-post-bottom-sheet",
                    id: post.post_id,
                  })
                }
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.16)",
                    "rgba(255, 255, 255, 0.32)",
                  ]}
                  style={styles.blurContainer}
                >
                  <EllipsisIcon size={20} color={colors.brand.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  videoPlayer: {
    height: ScreenHeight,
    justifyContent: "center",
  },
  blurContainer: {
    padding: 12,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  container: {
    flex: 1,
  },
  overlay: {
    top: "50%",
  },
  footer: {
    paddingHorizontal: 24,
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  rightColumn: {
    gap: 16,
  },
});

export default memo(ReelsPost);
