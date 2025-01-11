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
import {
  Platform,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/hooks/use-auth";
import createComment from "@/api/social/post/comment/create-comment";
import { orderBy, uniqBy } from "lodash";
import CommentInput from "./comment-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CommentBottomSheet = React.forwardRef<BottomSheet>((_, ref) => {
  const insets = useSafeAreaInsets()
  const { user } = useAuth();
  const commentInputRef = useRef<{ focusInput: () => void }>(null);
  const [skip, setSkip] = useState(0);
  const [isFocus, setIsFocus] = useState(false)
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newCommentData, setNewCommentData] = useState<CreateCommentBody>(
    {} as CreateCommentBody
  );
  const snapPoints = useMemo(() => ["60%", "80%", "92%"], []);

  const { postId, isVisible, currentType, closeBottomSheet, callback } =
    useBottomSheetContext();

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

  const mapParentId = useCallback(
    (parentId: number | null, commentsRequest: Comment[]): Array<Comment> => {
      const commentsMap = commentsRequest.map((comment) => {
        return {
          ...comment,
          parentId: parentId || null,
          subComments: [],
        };
      });

      return commentsMap;
    },
    []
  );

  const mapComments = useCallback(
    (
      parentId: number,
      commentsRequest: Comment[],
      commentsSetted: Comment[]
    ): Comment[] => {
      if (!parentId) {
        return commentsRequest;
      }

      const newData = [];

      for (const commentValue of commentsSetted) {
        if (commentValue.id === parentId) {
          commentValue.subComments?.push(...commentsRequest);

          newData.push(commentValue);
        }
      }

      return newData;
    },
    []
  );

  const loadPostComments = useCallback(
    async (
      isLoadMore = false,
      params: Partial<GetPostCommentsProps> = {},
      options: Partial<{ skipValue: number }> = {}
    ) => {
      const { skipValue } = options;

      try {
        if (!postId || loading) return;

        setLoading(true);

        const limit = 10;
        const skipCurrent = skipValue != null ? skipValue : skip;

        const data = await getPostComments({
          postId,
          skip: skipCurrent,
          limit,
          ...params,
        });

        if (data.length === 0) {
          setHasMore(false);
        }

        if (data.length) {
          const commentsMappedParentId = mapParentId(
            params.parentId || null,
            data
          );

          setSkip(skipCurrent + limit);

          setComments((prevComments) => {
            const commentBuild = mapComments(
              params.parentId || 0,
              commentsMappedParentId,
              prevComments
            );

            if (isLoadMore) {
              return orderBy(
                uniqBy([...prevComments, ...commentBuild], "id"),
                "created_at",
                "desc"
              );
            }

            return [...commentBuild];
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Opss",
          text2: "Erro ao buscar comentários. Tente novamente mais tarde.",
        });
      } finally {
        setLoading(false);
      }
    },
    [skip, postId, loading, mapComments, mapParentId, setLoading]
  );

  const handleClose = useCallback(() => {
    setComments([]);
    setSkip(0);
    setIsFocus(false);
    handlerNewCommentData({});
    closeBottomSheet();
  }, [closeBottomSheet, handlerNewCommentData]);

  const handleCommentSubmit = useCallback(async (value: { comment: string }) => {
    const { comment } = value

      try {
        setIsLoadingAddComment(true);
        const res = await createComment({
          postId: postId!,
          content: comment,
          parentId: newCommentData.parentId,
        });

        if (!newCommentData.parentId) {
          const comment = {
            id: res.id,
            content: res.content,
            like_count: 0,
            reply_count: 0,
            created_at: res.created_at,
            user: { ...user, is_following: false },
            is_liked: false,
          } as Comment;

          setComments((prev) => [...[comment], ...prev]);
        }

        setIsFocus(false)
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
  }, [postId, newCommentData]);

  const removeSubComments = useCallback(
    (
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
    },
    []
  );

  const handleLoadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadPostComments(true);
    }
  }, [loading, hasMore, loadPostComments]);

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
      setComments(
        comments.filter((commentSaved) => commentSaved.id !== comment.id)
      );
    },
    [comments]
  );

  const handlerAddParentComment = useCallback(
    (comment: Comment) => {    
      handlerNewCommentData({ parentId: comment.id });
      setIsFocus(true)
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
        const commenstHide = removeSubComments(comments, comment.id);

        setComments(commenstHide);
      } else {
        await loadPostComments(
          true,
          { parentId: comment.id },
          { skipValue: comment.subComments?.length ?? 0 }
        );
      }
    },
    [
      postId,
      comments,
      loading,
      skip,
      loadPostComments,
      removeSubComments,
      setSkip,
    ]
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

  useEffect(() => {
    if (postId && isVisible) {
      setHasMore(true);
      loadPostComments(true);
    }
  }, [postId, isVisible]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        style={{
          paddingBottom: insets.bottom,
          paddingHorizontal: 8,
          backgroundColor: colors.black[100]
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
    [
      commentInputRef,
      user,
      isLoadingAddComment,
      handleCommentSubmit,
    ]
  );

  const bottomSheetList = useMemo(() => {
    return (
      <BottomSheetFlatList
        data={comments}
        keyExtractor={(item) => "key-" + item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="none"
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        enableFooterMarginAdjustment
        ListEmptyComponent={() => {
          if (!loading) {
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
  }, [comments, loading, renderItem, handleLoadMore]);

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
        <Loader isLoading={loading} />
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
      loading,
    ]
  );

  return isVisible && currentType === "comment" ? bottomSheet : null;
});

export default memo(CommentBottomSheet);
