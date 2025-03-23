import React, { memo, useCallback, useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronRight,
  EllipsisIcon,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { colors } from "@/styles/colors";
import LikeIcon from "@/assets/icons/like.svg";
import LikedIcon from "@/assets/icons/liked.svg";
import CommentIcon from "@/assets/icons/comment.svg";
import { router } from "expo-router";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { ReelsDetail } from "@/api/@types/models";
import { formatDistance, getInitials } from "@/lib/utils";
import Toast from "react-native-toast-message";
import { deleteLike } from "@/api/social/post/like/delete-like";
import { createLike } from "@/api/social/post/like/create-like";
import { useAuth } from "@/hooks/use-auth";
import VideoPlayer from "@/components/player/Video";
import { createView } from "@/api/social/post/view/create-view";
import { usePlayerContext } from "@/context/player-context";

interface Props {
  post: ReelsDetail;
  handlerAudioMute: (muted: boolean) => void;
  activePostId: number | null;
  audioMute: boolean;
  playerRef: any;
  isVisible: boolean;
}

const WeedzPostCard = ({ post, playerRef, isVisible }: Props) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [likedCount, setLikedCount] = useState(post.like_count);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isViewed, setIsViewed] = useState(post.is_viewed);
  const { openBottomSheet } = useBottomSheetContext();
  const { user } = useAuth();

  const { isMuted, toggleMute } = usePlayerContext();

  const handleToggleDescription = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleLike = async () => {
    try {
      setIsLoadingLiked(true);
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
      console.log("Erro em handleLike", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: `Aconteceu um erro no ${
          liked ? "deslike" : "like"
        } do post. Tente novamente mais tarde.`,
      });
    } finally {
      setIsLoadingLiked(false);
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
    }
  };

  const handlerOpenCommentSheet = useCallback(() => {
    openBottomSheet({
      type: "comment",
      id: post.post_id,
    });
  }, []);

  return (
    <View className="flex flex-1 gap-5 my-3">
      <View className="flex flex-row items-center justify-between gap-2 mx-2">
        <TouchableOpacity
          className="flex flex-row items-center gap-2"
          onPress={() =>
            router.push({
              pathname: "/profile/[id]",
              params: { id: post.user.id },
            })
          }
        >
          <Avatar className="w-10 h-10 bg-black-80">
            {post?.user?.image?.image && (
              <AvatarImage
                className="rounded-full"
                source={{ uri: post.user.image.image }}
              />
            )}
            <AvatarFallback>
              {getInitials(post?.user?.name || post?.user?.username)}
            </AvatarFallback>
          </Avatar>
          <Text className="text-white text-sm text-center font-semibold">
            {post?.user?.name || post?.user?.username}
          </Text>
        </TouchableOpacity>

        <View className="flex flex-row items-center gap-2">
          <Text className="text-brand-grey text-sm">
            {formatDistance(post.created_at)}
          </Text>
          {user.id !== post.user.id && (
            <TouchableOpacity
              onPress={() =>
                openBottomSheet({ type: "report", id: post.post_id })
              }
            >
              <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
            </TouchableOpacity>
          )}
          {user.id === post.user.id && (
            <TouchableOpacity
              onPress={() =>
                openBottomSheet({
                  type: "reel-post-bottom-sheet",
                  id: post.post_id,
                })
              }
            >
              <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.aspectView}>
        <VideoPlayer
          playerRef={playerRef}
          uri={post.file?.file}
          videoId={post.post_id}
          playVideo={() => viewVideo(post)}
          isVisible={isVisible}
        />
      </View>

      <View className="flex flex-col">
        <View className="relative">
          <View className="absolute bottom-12 w-full flex flex-row justify-between items-center px-4">
            <View className="border border-black-80 bg-white px-4 py-2 rounded-full">
              <TouchableOpacity onPress={toggleMute}>
                {isMuted ? (
                  <VolumeX size={20} color={colors.brand.black} />
                ) : (
                  <Volume2 size={20} color={colors.brand.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="gap-4 mx-4">
          <View className="flex flex-row items-center gap-3">
            {isLoadingLiked ? (
              <ActivityIndicator
                color="#fff"
                size="small"
                className="w-7 h-7"
              />
            ) : (
              <TouchableOpacity
                className="flex flex-row items-center gap-1"
                onPress={handleLike}
              >
                {liked ? (
                  <LikedIcon width={24} height={24} />
                ) : (
                  <LikeIcon width={24} height={24} />
                )}
                {likedCount > 0 && (
                  <Text className="text-white font-medium">{likedCount}</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex flex-row items-center gap-1"
              onPress={handlerOpenCommentSheet}
            >
              <CommentIcon width={24} height={24} />
              {post.comment_count > 0 && (
                <Text className="text-white font-medium">
                  {post.comment_count}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {post.description && (
            <>
              <Text
                className="flex-wrap w-full text-start text-ellipsis text-base text-brand-grey font-normal"
                numberOfLines={isExpanded ? undefined : 3}
                ellipsizeMode="tail"
              >
                {post.description}
              </Text>
              {post.description.split(/\s+/).length > 40 && (
                <TouchableOpacity onPress={handleToggleDescription}>
                  <Text className="text-base text-primary font-semibold">
                    {isExpanded ? "ver menos" : "continuar lendo"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {post.comment_count > 0 && (
            <TouchableOpacity
              className="flex flex-row items-end gap-1 pt-3 mb-3 bg-black-100"
              onPress={() =>
                openBottomSheet({ type: "comment", id: post.post_id })
              }
            >
              <Text className="text-base text-brand-grey font-semibold">
                {`Ver todos os ${post.comment_count} comentários`}
              </Text>
              <ChevronRight width={16} height={16} color={colors.brand.grey} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  aspectView: {
    width: "100%", // Ajuste conforme necessário para o tamanho desejado
    aspectRatio: 1080 / 1350, // Mantém a proporção correta
  },
});

export default memo(WeedzPostCard);
