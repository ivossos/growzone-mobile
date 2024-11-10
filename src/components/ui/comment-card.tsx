import React, { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { colors } from '@/styles/colors';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { DotIcon, EllipsisIcon } from 'lucide-react-native';
import LikeIcon from "@/assets/icons/like.svg";
import LikedIcon from "@/assets/icons/liked.svg";
import CommentIcon from "@/assets/icons/comment.svg";
import { Comment } from '@/api/@types/models';
import { formatDistance, getInitials } from '@/lib/utils';
import { deleteCommentLike } from '@/api/social/post/comment/delete-comment-like';
import { createCommentLike } from '@/api/social/post/comment/create-comment-like';
import Toast from 'react-native-toast-message';

interface Props {
  comment: Comment;
}

export default function CommentCard({ comment }: Props) {
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await deleteCommentLike(comment.id);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await createCommentLike(comment.id);
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (err) {
      console.log('Erro em handleLike', err);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: `Aconteceu um erro no ${isLiked ? 'deslike' : 'like'} do comentário. Tente novamente mais tarde.`
      });
    }
  };

  return (
    <View className='flex flex-col gap-2 bg-black-100 mb-4'>
      <View className="flex flex-row items-center justify-between gap-2 w-full">
        <View className="flex flex-row items-center gap-2">
          <Avatar className="w-10 h-10 bg-black-80">
            {comment.user?.image?.image && (
              <AvatarImage className="rounded-full" source={{ uri: comment.user?.image?.image }} />
            )}
            <AvatarFallback>{getInitials(comment?.user?.name || comment?.user?.username)}</AvatarFallback>
          </Avatar>
          <View className="flex flex-row items-center">
            <Text className="text-white text-sm text-center font-semibold">
              {comment?.user?.name || comment?.user?.username}
            </Text>
            <DotIcon className="w-3 h-3" color={colors.black[70]} />
            <Text className="text-brand-grey text-xs">{formatDistance(comment.created_at)}</Text>
          </View>
        </View>

        <View className="flex flex-row items-center">
          <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
        </View>
      </View>

      <View className='flex flex-row gap-2 min-h-min'>
        <View className='max-w-10 w-full'>
          <View className='h-auto w-[1px] bg-black-80 mx-auto' />
        </View>

        <View className='flex flex-col'>
          <Text className="text-start text-sm text-brand-grey font-normal max-w-full">
            {comment.content}
          </Text>
          <View className="flex flex-row items-center gap-3 mt-2">
            <TouchableOpacity className="flex flex-row items-center gap-1" onPress={handleLike}>
              {isLiked ? (
                <LikedIcon width={24} height={24} />
              ) : (
                <LikeIcon width={24} height={24} />
              )}
              {likeCount > 0 && <Text className="text-white font-medium">{likeCount}</Text>}
            </TouchableOpacity>

            {/* <TouchableOpacity className="flex flex-row items-center gap-1">
              <CommentIcon width={24} height={24} />
              {comment.reply_count > 0 && <Text className="text-white font-medium">{comment.reply_count}</Text>}
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </View>
  );
}
