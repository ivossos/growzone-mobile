import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import Toast from "react-native-toast-message";
import {
  Comment,
  CreateCommentBody,
  GetPostCommentsProps,
} from "@/api/@types/models";
import CommentCard from "./comment-card";
import Loader from "./loader";
import { FlatList, Platform, Text, View } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import createComment from "@/api/social/post/comment/create-comment";
import CommentInput from "./comment-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayerContext } from "@/context/video-player-context";
import useComments from "@/hooks/useComments";
import { queryClient } from "@/lib/react-query";

const CommentBottomSheet = React.forwardRef<BottomSheet>((_, ref) => {
  const { playVideo } = useVideoPlayerContext();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const commentInputRef = useRef<{ focusInput: () => void }>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [parentId, setParentId] = useState<number>();
  const [newCommentData, setNewCommentData] = useState<CreateCommentBody>(
    {} as CreateCommentBody
  );
  const snapPoints = useMemo(() => ["60%", "80%", "90%"], []);

  const { postId, isVisible, currentType, closeBottomSheet, callback } =
    useBottomSheetContext();

  const { comments, submitComment, deleteComment } = useComments({
    postId: postId || 0,
    parentId,
    currentType,
  });

  const handlerNewCommentData = useCallback(
    (data: Partial<CreateCommentBody>) => {
      const isEmptyData = Object.keys(data).length === 0;

      const dataComment: Partial<CreateCommentBody> = isEmptyData
        ? {}
        : {
            content: data.content || newCommentData.content,
            postId: postId || 0,
            parentId: data.parentId || newCommentData.parentId,
          };

      setNewCommentData(dataComment as any);
    },
    [newCommentData, postId, setNewCommentData]
  );

  const handleClose = useCallback(() => {
    setIsFocus(false);
    handlerNewCommentData({});
    playVideo();
    queryClient.removeQueries({ queryKey: ["sub-comments-posts"] });
    queryClient.removeQueries({ queryKey: ["comments-posts"] });
    closeBottomSheet();
  }, [closeBottomSheet, handlerNewCommentData, queryClient]);

  const handleCommentSubmit = useCallback(
    async (value: { comment: string }) => {
      const { comment } = value;

      try {
        await submitComment.createComment({
          postId: postId!,
          content: comment,
          parentId: newCommentData.parentId,
        });

        setIsFocus(false);
        handlerNewCommentData({});
        if (callback) {
          await callback(true);
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Opss",
          text2: "Aconteceu um erro ao enviar seu comentário.",
        });
      }
    },
    [postId, newCommentData]
  );

  const removeSubComments = (
    comments: Array<Comment>,
    commentToHideId: number | null
  ): Array<Comment> => {
    return comments.map((comment) => {
      if (comment.id === commentToHideId) {
        return {
          ...comment,
          subComments: [],
        };
      }

      return {
        ...comment,
        subComments: comment.subComments?.length
          ? removeSubComments(comment.subComments, commentToHideId)
          : comment.subComments,
      };
    });
  };

  const removeSubCommentsFromCache = useCallback(
    (postId: number, commentToHideId: number | null, parentId?: number) => {
      const keyCacheAllCommentsPost = ["comments-posts", postId];

      const allCommentsInCache: any = queryClient.getQueryData(
        keyCacheAllCommentsPost
      );

      if (!allCommentsInCache) {
        console.error("Comentários não encontrados no cache");
        return;
      }

      const updatedComments = removeSubComments(
        allCommentsInCache?.pages?.flat(),
        commentToHideId
      );

      queryClient.setQueryData(
        keyCacheAllCommentsPost,
        (commentsInCache: any) => {
          return {
            pageParams: [0],
            pages: updatedComments,
          };
        }
      );

      queryClient.removeQueries({
        queryKey: ["sub-comments-posts", parentId, postId, currentType],
      });
    },
    [currentType]
  );

  const handleLoadMore = useCallback(async () => {
    if (comments.hasNextPage) {
      await comments.fetchNextPage();
    }
  }, [comments.hasNextPage, comments.fetchNextPage]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const handlerAddParentComment = useCallback(
    (comment: Comment) => {
      handlerNewCommentData({ parentId: comment.id });
      setIsFocus(true);
      commentInputRef.current?.focusInput();
    },
    [commentInputRef.current, handlerNewCommentData]
  );

  const handlerParentComment = useCallback(
    async (
      comment: Comment,
      options?: Partial<{
        show: boolean;
      }>
    ) => {
      const optionsIsNotNull = options && Object.keys(options).length > 0;

      if (optionsIsNotNull && !options.show) {
        setParentId(undefined);
        removeSubCommentsFromCache(postId || 0, comment.id, parentId);
      } else {
        setParentId(comment.id);
      }
    },
    [parentId, postId, removeSubCommentsFromCache]
  );

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => {
      return (
        <BottomSheetView>
          <CommentCard
            canAcceptSubcomments
            handlerAddParentComment={handlerAddParentComment}
            handlerParentComment={handlerParentComment}
            setParentId={setParentId}
            deleteComment={deleteComment}
            comment={item}
          />
        </BottomSheetView>
      );
    },
    [deleteComment, setParentId, handlerAddParentComment, handlerParentComment]
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        style={{
          paddingBottom: insets.bottom,
          paddingHorizontal: 8,
          backgroundColor: colors.black[100],
        }}
        {...props}
      >
        <CommentInput
          ref={commentInputRef}
          user={user}
          isFocus={isFocus}
          handleCommentSubmit={handleCommentSubmit}
          isLoadingAddComment={submitComment.isPendingCreateComment}
        />
      </BottomSheetFooter>
    ),
    [commentInputRef, user, submitComment, handleCommentSubmit]
  );

  const bottomSheetList = useMemo(() => {
    return (
      <BottomSheetView>
        <FlatList
          data={comments.data}
          keyExtractor={(item, index) => `key-${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 50,
          }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none"
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={() => {
            if (comments.isLoading) {
              return <Loader isLoading />;
            }
          }}
          ListEmptyComponent={() => {
            if (!comments.isLoading) {
              return (
                <View className="flex flex-col justify-center items-center flex-1 py-10">
                  <Text className="font-medium text-white text-lg">
                    Nenhum comentário nessa postagem
                  </Text>
                </View>
              );
            }
          }}
          onEndReachedThreshold={0.8}
          onEndReached={handleLoadMore}
        />
      </BottomSheetView>
    );
  }, [comments.data, comments.isLoading, renderItem, handleLoadMore]);

  const bottomSheet = useMemo(
    () => (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={true}
        handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
        keyboardBlurBehavior="restore"
        keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
        footerComponent={renderFooter}
      >
        {bottomSheetList}
      </BottomSheet>
    ),
    [
      ref,
      snapPoints,
      colors.black,
      renderBackdrop,
      handleClose,
      bottomSheetList,
      renderFooter,
    ]
  );

  return isVisible && currentType === "comment" ? bottomSheet : null;
});

export default memo(CommentBottomSheet);
