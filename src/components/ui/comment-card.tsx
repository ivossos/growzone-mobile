import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { colors } from "@/styles/colors";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { DotIcon, MessageCircleWarning, Minus } from "lucide-react-native";
import LikeIcon from "@/assets/icons/like.svg";
import LikedIcon from "@/assets/icons/liked.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import { Comment } from "@/api/@types/models";
import { formatDistance, getInitials, getUserName } from "@/lib/utils";
import { deleteLikeComment } from "@/api/social/post/comment/delete-comment-like";
import { createCommentLike } from "@/api/social/post/comment/create-comment-like";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { Modal } from "../Modal";
import Button from "./button";
import { deleteComment } from "@/api/social/post/comment/delete-comment";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  comment: Comment;
  loadComments: (comment: Comment) => Promise<void>;
  level?: number;
  canAcceptSubcomments?: boolean;
  handlerAddParentComment?: (comment: Comment) => void;
  handlerParentComment?: (
    comment: Comment,
    options?: Partial<{ show: boolean }>
  ) => Promise<void>;
}

const MAX_LEVEL_COMMENTS = 1;

export default function CommentCard({
  comment,
  level = 0,
  canAcceptSubcomments = false,
  loadComments,
  handlerAddParentComment,
  handlerParentComment,
}: Props) {
  const { user } = useAuth();
  const { openBottomSheet } = useBottomSheetContext();
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment>(
    {} as Comment
  );

  const handleLike = async () => {
    try {
      let commentLiked = false;

      if (isLiked) {
        await deleteLikeComment(comment.id);
      } else {
        await createCommentLike(comment.id);
        commentLiked = true;
      }

      setIsLiked(commentLiked);
    } catch (err) {
      console.log("Erro em handleLike", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: `Aconteceu um erro no ${
          isLiked ? "deslike" : "like"
        } do comentário. Tente novamente mais tarde.`,
      });
    }
  };

  const handleShowParentComment = async (
    commentValue: Comment,
    { show }: { show: boolean }
  ) => {
    await handlerParentComment!(commentValue, { show });
  };

  const redirectProfileUser = useCallback(() => {
    router.push({
      pathname: "/profile/[id]",
      params: { id: comment.user.id },
    });
  }, [comment.user.id]);

  const findUserName = useMemo(() => {
    return getUserName(comment?.user);
  }, [comment]);

  const handlerButtonSheetReportComment = useCallback(async () => {
    setIsLoading(true);
    setSelectedComment({} as Comment);

    openBottomSheet({
      type: "report-comment",
      id: selectedComment.id,
      callbackFn: async (data) => {
        setIsLoading(false);
      },
    });
  }, [selectedComment]);

  const handleDeleteComment = useCallback(async () => {
    setIsLoading(true);

    try {
      await deleteComment(selectedComment.id);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: `Comentário excluído com sucesso.`,
      });

      await loadComments(selectedComment);
    } catch (err) {
      console.log("Erro em handleLike", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: `Aconteceu um erro para excluír o comentário.`,
      });
    }

    setSelectedComment({} as Comment);
    setIsLoading(false);
  }, [selectedComment]);

  const modalActionContent = useMemo(() => {
    if (selectedComment && !selectedComment.id) {
      return null;
    }

    const userName = getUserName(selectedComment?.user);

    return (
      <View className="gap-4">
        <View className="flex flex-row gap-2 items-center">
          <View>
            <Avatar className="w-10 h-10 bg-black-80">
              {selectedComment.user?.image?.image && (
                <AvatarImage
                  className="rounded-full"
                  source={{ uri: selectedComment.user?.image?.image }}
                />
              )}
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
          </View>
          <View>
            <Text className="text-white text-sm font-semibold">{userName}</Text>
          </View>
        </View>
        <Text className="text-start text-sm text-brand-grey font-normal max-w-full mb-4 line-clamp-8 overflow-hidden">
          {selectedComment.content}
        </Text>

        <View className="gap-4">
          <Button
            title="Denunciar comentário"
            handlePress={handlerButtonSheetReportComment}
            variant="secondary"
            isLoading={isLoading}
            isDisabled={isLoading}
            containerStyles="gap-2"
            leftIconProps={{ color: colors.primary }}
            leftIcon={MessageCircleWarning}
          />

          <Button
            title="Excluir comentário"
            handlePress={handleDeleteComment}
            variant="secondary"
            isLoading={isLoading}
            isDisabled={isLoading || user.id !== selectedComment.user.id}
            containerStyles="gap-2"
            leftIcon={TrashIcon}
          />
        </View>
      </View>
    );
  }, [selectedComment, isLoading]);

  if (level > MAX_LEVEL_COMMENTS) {
    return null;
  }

  return (
    <>
      <View className="gap-2 mb-4">
        <View className="gap-2">
          <TouchableOpacity onLongPress={() => setSelectedComment(comment)}>
            <View className="gap-2">

              <View className="flex items-center justify-between flex-row gap-2">

                <View className="flex items-center flex-row gap-2">
                  <View>
                    <TouchableOpacity onPress={() => redirectProfileUser()}>
                      <Avatar className="w-10 h-10 bg-black-80">
                        {comment.user?.image?.image && (
                          <AvatarImage
                            className="rounded-full"
                            source={{ uri: comment.user?.image?.image }}
                          />
                        )}
                        <AvatarFallback>
                          {getInitials(findUserName)}
                        </AvatarFallback>
                      </Avatar>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => redirectProfileUser()}
                    className="text-white text-sm text-center font-semibold"
                  >
                    <View className="flex flex-row items-center">
                      <Text className="text-white text-sm text-center font-semibold">
                        {findUserName}
                      </Text>
                      <DotIcon className="w-3 h-3" color={colors.black[70]} />
                      <Text className="text-brand-grey text-xs">
                        {formatDistance(comment.created_at)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    className="flex flex-row gap-1"
                    onPress={handleLike}
                  >
                    {isLiked ? (
                      <LikedIcon width={24} height={24} />
                    ) : (
                      <LikeIcon width={24} height={24} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginStart: 36 }}>
                <Text className="text-start text-sm text-brand-grey font-normal max-w-full">
                  {comment.content}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {canAcceptSubcomments && level < MAX_LEVEL_COMMENTS && (
            <View>
              <TouchableOpacity
                onPress={() => handlerAddParentComment!(comment)}
              >
                <Text className="text-base font-regular text-brand-grey">
                  Responder comentário
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {canAcceptSubcomments && (
          <View>
            {comment.subComments?.map((subComment) => (
              <View className="pl-4" key={`${subComment.id}_sub_comment`}>
                <CommentCard
                  canAcceptSubcomments
                  handlerAddParentComment={() =>
                    handlerAddParentComment!(subComment)
                  }
                  handlerParentComment={() =>
                    handleShowParentComment!(subComment, {
                      show:
                        subComment.subComments?.length !==
                        subComment.reply_count,
                    })
                  }
                  comment={subComment}
                  level={level + 1}
                  loadComments={() => loadComments(subComment)}
                />
              </View>
            ))}

            {comment.reply_count > 0 ? (
              <View className="flex flex-row gap-2">
                <Minus color={colors.brand.grey} />
                <TouchableOpacity
                  onPress={() =>
                    handleShowParentComment!(comment, {
                      show: comment.subComments?.length !== comment.reply_count,
                    })
                  }
                >
                  <Text className="text-base font-regular text-brand-grey">
                    {`${
                      comment.subComments?.length !== comment.reply_count
                        ? "Exibir comentários"
                        : "Visualizar menos"
                    }`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {selectedComment && selectedComment.id && (
        <Modal
          transparent
          animationType="fade"
          visible={!!selectedComment}
          closeModal={() => setSelectedComment({} as Comment)}
          onRequestClose={() => setSelectedComment({} as Comment)}
        >
          {modalActionContent}
        </Modal>
      )}
    </>
  );
}
