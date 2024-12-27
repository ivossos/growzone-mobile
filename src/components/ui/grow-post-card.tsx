import React, { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import {
  CalendarDaysIcon,
  ChevronRight,
  EllipsisIcon,
} from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { colors } from "@/styles/colors";
import MediaSlider from "./media-slider";
import LikeIcon from "@/assets/icons/like.svg";
import LikedIcon from "@/assets/icons/liked.svg";
import CommentIcon from "@/assets/icons/comment.svg";
import { router } from "expo-router";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { GrowPostDetail} from "@/api/@types/models";
import { formatDistance, getInitials } from "@/lib/utils";
import Toast from "react-native-toast-message";
import { deleteLike } from "@/api/social/post/like/delete-like";
import { createLike } from "@/api/social/post/like/create-like";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  post: GrowPostDetail;
}

const GrowPostCard = ({ post }: Props) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [likedCount, setLikedCount] = useState(post.like_count);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { openBottomSheet } = useBottomSheetContext();
  const { user } = useAuth();

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

  return (
    <View className="flex gap-6 mx-6 my-3">
      <View className="flex flex-row items-center justify-between gap-2 w-full">
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
          {user.id !== post.user.id && <TouchableOpacity onPress={() => openBottomSheet({ type: "report", id: post.post_id })}>
            <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
          </TouchableOpacity>}
          {user.id === post.user.id && <TouchableOpacity onPress={() => openBottomSheet({ type: "grow-post-bottom-sheet", id: post.post_id })}>
            <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
          </TouchableOpacity>}
        </View>
      </View>

      <View className="relative">
        <MediaSlider items={post.files} postId={post.post_id} />
        <View className="absolute bottom-4 left-2 border border-black-80 bg-white px-2 py-1 rounded-full">
          <Text className="text-black text-base ">{post.phase.name}</Text>
        </View>
      </View>

      <View className="flex flex-col gap-2">
        <View className="flex flex-row justify-between gap-1">
          <View className="border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <Text className="text-brand-green text-base ">
              {post.strain.name}
            </Text>
          </View>
          <View className="flex flex-row item-center justify-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <CalendarDaysIcon size={16} color={colors.brand.green} />
            <Text className="text-brand-green text-base ">
              {post.day === 1 ? `${post.day} dia` : `${post.day} dias`}
            </Text>
          </View>
        </View>
        <View className="flex flex-row items-center gap-3">
          {isLoadingLiked ? (
            <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
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
            onPress={() =>
              openBottomSheet({ type: "comment", id: post.post_id })
            }
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
            {post.description.split(/\s+/).length > 50 && (
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
  );
};

export default memo(GrowPostCard);
