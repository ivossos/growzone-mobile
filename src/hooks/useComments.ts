import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { queryClient } from "@/lib/react-query";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import createCommentApi from "@/api/social/post/comment/create-comment";
import { orderBy, uniqBy } from "lodash";
import { BottomSheetType } from "@/context/bottom-sheet-context";
import { Comment } from "@/api/@types/models";
import { useAuth } from "./use-auth";
import { deleteComment as deleteCommentApi } from "@/api/social/post/comment/delete-comment";

const useComments = (props: {
  postId: number;
  parentId?: number;
  currentType: BottomSheetType | null;
}) => {
  const { user } = useAuth();
  const limit = 10;

  const mapParentId = (
    parentId: number | null,
    comments: Comment[]
  ): Comment[] =>
    comments.map((comment) => ({
      ...comment,
      parentId: parentId || null,
      subComments: [],
    }));

  const combineComments = (
    parentId: number | null,
    newComments: Comment[],
    cachedComments: Comment[]
  ): Comment[] => {
    if (!parentId) return newComments;

    return cachedComments.map((comment) =>
      comment.id === parentId
        ? {
            ...comment,
            subComments: [...(comment.subComments || []), ...newComments],
          }
        : comment
    );
  };

  const orderByComments = (comments: Comment[]) => {
    return orderBy(comments, "created_at", "desc");
  };

  const fetchCommentsPaginationData = async ({
    pageParam = 0,
  }: {
    pageParam: number;
  }) => {
    const fetchedComments = await getPostComments({
      postId: props.postId,
      limit,
      skip: pageParam,
    });

    if (!fetchedComments.length) return [];

    const mappedComments = mapParentId(props.parentId || null, fetchedComments);

    return orderByComments(mappedComments);
  };

  const fetchSubCommentsData = async ({
    pageParam = 0,
  }: {
    pageParam: number;
  }) => {
    const keyCache = ["comments-posts", props.postId];

    const fetchedSubComments = await getPostComments({
      postId: props.postId,
      limit,
      parentId: props.parentId,
      skip: pageParam,
    });

    if (!fetchedSubComments.length) return [];

    const fetchedSubCommentsOrderBy = orderByComments(fetchedSubComments);

    queryClient.setQueryData(keyCache, (data: any) => {
      if (!data) return [];
      const comments = data.pages.flat() || [];

      const combinedComments = combineComments(
        props.parentId || null,
        fetchedSubCommentsOrderBy,
        comments
      );

      return {
        ...data,
        pages: combinedComments,
      };
    });

    return fetchedSubCommentsOrderBy;
  };

  useInfiniteQuery({
    queryKey: [
      "sub-comments-posts",
      props.parentId,
      props.postId,
      props.currentType,
    ],
    queryFn: fetchSubCommentsData,
    enabled: props.parentId != null && props.currentType === "comment",
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < limit ? undefined : allPages.length * limit,
    initialPageParam: 0,
  });

  const {
    data: commentsPosts,
    error: commentsError,
    fetchNextPage,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComment,
    isSuccess: isSuccessComment,
  } = useInfiniteQuery({
    queryKey: ["comments-posts", props.postId],
    queryFn: fetchCommentsPaginationData,
    enabled: props.postId != null && props.currentType === "comment",
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < limit ? undefined : allPages.length * limit,
    initialPageParam: 0,
  });

  const { mutateAsync: createComment, isPending: isPendingCreateComment } =
    useMutation({
      mutationFn: createCommentApi,
      async onSuccess(commentResponse) {
        const keyCache = ["comments-posts", props.postId];

        queryClient.setQueryData(keyCache, (data: any) => {
          if (!data) return [];
          let comments: Array<Comment> = data.pages.flat() || [];

          const newCommentAdd: Comment = {
            id: commentResponse.id,
            content: commentResponse.content,
            created_at: commentResponse.created_at,
            is_liked: false,
            like_count: 0,
            reply_count: 0,
            user: {
              ...user,
              is_following: false,
            },
            subComments: [],
          };

          if (commentResponse.parent_id) {
            comments = combineComments(
              commentResponse.parent_id || null,
              [newCommentAdd],
              comments
            );
          } else {
            comments.push(newCommentAdd);
          }

          return {
            ...data,
            pages: comments,
          };
        });
      },
      async onError(error) {
        console.error("erro on create Follow", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro ao realizar essa ação. Tente novamente mais tarde.",
        });
      },
    });

  const { mutateAsync: deleteComment, isPending: isPendingDeleteComment } =
    useMutation({
      mutationFn: deleteCommentApi,
      async onSuccess() {
        const keyCache = ["comments-posts", props.postId];


        queryClient.removeQueries({ queryKey: ["sub-comments-posts"] })
        await queryClient.invalidateQueries({ queryKey: keyCache })
      },
      async onError(error) {
        console.error("erro on delete comment", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro ao realizar essa ação. Tente novamente mais tarde.",
        });
      },
    });

  if (commentsError) {
    console.error("Erro ao carregar os comentários: ", commentsError);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao carregar os comentários. Tente novamente mais tarde.",
    });
  }

  return {
    comments: {
      data: commentsPosts?.pages.flat() || [],
      isLoading: isLoadingComment,
      fetchNextPage,
      refetch,
      hasNextPage,
      isFetchingNextPage,
    },
    submitComment: {
      createComment,
      isPendingCreateComment,
    },
    deleteComment: {
      deleteComment,
      isPendingDeleteComment
    }
  };
};

export default useComments;
