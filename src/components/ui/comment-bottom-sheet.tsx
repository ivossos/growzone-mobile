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
import { Platform, Text, View } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import createComment from "@/api/social/post/comment/create-comment";
import { orderBy, uniqBy } from "lodash";
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
  const [skip, setSkip] = useState<number | undefined>();
  const [isFocus, setIsFocus] = useState(false);
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);
  const [parentId, setParentId] = useState<number>();
  const [newCommentData, setNewCommentData] = useState<CreateCommentBody>(
    {} as CreateCommentBody
  );
  const snapPoints = useMemo(() => ["60%", "80%", "92%"], []);

  const { postId, isVisible, currentType, closeBottomSheet, callback } =
    useBottomSheetContext();

  const { comments } = useComments({
    postId: postId || 0,
    parentId,
    currentType,
    skip,
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
    setSkip(0);
    setIsFocus(false);
    handlerNewCommentData({});
    playVideo();
    closeBottomSheet();
  }, [closeBottomSheet, handlerNewCommentData]);

  const handleCommentSubmit = useCallback(
    async (value: { comment: string }) => {
      const { comment } = value;

      try {
        setIsLoadingAddComment(true);
        const res = await createComment({
          postId: postId!,
          content: comment,
          parentId: newCommentData.parentId,
        });

        if (!newCommentData.parentId) {
          // const comment = {
          //   id: res.id,
          //   content: res.content,
          //   like_count: 0,
          //   reply_count: 0,
          //   created_at: res.created_at,
          //   user: { ...user, is_following: false },
          //   is_liked: false,
          // } as Comment;
          // setComments((prev) => [...[comment], ...prev]);
        }

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
      } finally {
        setIsLoadingAddComment(false);
      }
    },
    [postId, newCommentData]
  );

  const removeSubCommentsFromCache = useCallback(
    (commentToHideId: number | null, postId: number, parentId?: number) => {
      // Acesse o cliente do React Query

      // Recupere os dados do cache
      const cachedComments: any = queryClient.getQueryData([
        "comments-posts",
        { postId, parentId, currentType },
      ]);

      if (!cachedComments) {
        console.error("Comentários não encontrados no cache");
        return;
      }

      // Função recursiva para remover subcomentários
      const removeSubComments = (
        comments: Array<Comment>,
        commentToHideId: number | null
      ): Array<Comment> => {
        return comments.map((comment) => {
          if (comment.id === commentToHideId) {
            return {
              ...comment,
              subComments: [], // Limpa os subcomentários
            };
          }

          return {
            ...comment,
            subComments: comment.subComments?.length
              ? removeSubComments(comment.subComments, commentToHideId) // Recursão para subcomentários
              : comment.subComments,
          };
        });
      };

      // Aplica a remoção dos subcomentários ao cache
      const updatedComments = removeSubComments(
        cachedComments.pages.flat(),
        commentToHideId
      );

      // Atualiza os dados no cache com os comentários modificados
      queryClient.setQueryData(
        ["comments-posts", { postId, parentId, currentType }],
        {
          pages: [
            {
              data: updatedComments,
            },
          ],
        }
      );
    },
    []
  );

  const handleLoadMore = useCallback(async () => {
    if (comments.hasNextPage) {
      await comments.fetchNextPage();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const loadComments = useCallback(
    async (comment: Comment) => {
      if (callback) {
        callback(true);
      }
      const cachedComments: any = queryClient.getQueryData([
        "comments-posts",
        { postId, parentId, currentType },
      ]);

      if (!cachedComments) {
        console.error("Comentários não encontrados no cache");
        return;
      }

      const filteredComments = cachedComments.pages
        .flat()
        .filter((commentSaved: any) => commentSaved.id !== comment.id);

      queryClient.setQueryData(
        ["comments-posts", { postId, parentId, currentType }],
        {
          pages: [
            {
              data: filteredComments,
            },
          ],
        }
      );
    },
    [comments]
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

      setSkip(0);

      if (optionsIsNotNull && !options.show) {
        removeSubCommentsFromCache(postId, comment.id, parentId);
      } else {
        console.log("brendo 2 ", {
          postId: postId || 0,
          parentId,
          currentType,
          skip,
        });
        await queryClient.invalidateQueries({
          queryKey: [
            "comments-posts",
            { postId: postId, currentType: "comment" },
          ],
        });
        setParentId(comment.id);
        setSkip(comment.subComments?.length ?? 0);
      }
    },
    [postId, comments, skip, removeSubCommentsFromCache, setSkip]
  );

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => {
      return (
        <BottomSheetView>
          <CommentCard
            canAcceptSubcomments
            handlerAddParentComment={handlerAddParentComment}
            loadComments={loadComments}
            handlerParentComment={handlerParentComment}
            comment={item}
          />
        </BottomSheetView>
      );
    },
    [handlerAddParentComment, loadComments, handlerParentComment]
  );

  // useEffect(() => {
  //   if (postId && isVisible) {
  //     setHasMore(true);
  //     console.log('brendo 3');
  //     loadPostComments(true);
  //   }
  // }, [postId, isVisible]);

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
          isLoadingAddComment={isLoadingAddComment}
        />
      </BottomSheetFooter>
    ),
    [commentInputRef, user, isLoadingAddComment, handleCommentSubmit]
  );

  const bottomSheetList = useMemo(() => {
    return (
      <BottomSheetFlatList
        data={comments.data}
        keyExtractor={(item) => "key-" + item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="none"
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        enableFooterMarginAdjustment
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
        onEndReached={handleLoadMore}
      />
    );
  }, [comments, renderItem, handleLoadMore]);

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
        <Loader isLoading={comments.isLoading} />
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
      comments,
    ]
  );

  return isVisible && currentType === "comment" ? bottomSheet : null;
});

export default memo(CommentBottomSheet);
