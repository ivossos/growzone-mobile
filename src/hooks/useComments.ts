import { Comment } from "@/api/@types/models";
import { getPostComments } from "@/api/social/post/comment/get-comments";
import { BottomSheetType } from "@/context/bottom-sheet-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { orderBy, uniqBy } from "lodash";
import Toast from "react-native-toast-message";

const useComments = (props: {
  postId: number;
  parentId?: number;
  skip?: number;
  currentType: BottomSheetType | null;
}) => {
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

  const fetchCommentsData = async ({
    pageParam = 0,
  }: {
    pageParam: number;
  }) => {
    console.log('props ', props);
    
    const fetchedComments = await getPostComments({
      postId: props.postId,
      limit,
      parentId: props.parentId,
      skip: props.skip || pageParam,
    });

    if (!fetchedComments.length) return [];

    const mappedComments = mapParentId(props.parentId || null, fetchedComments);
    const combinedComments = combineComments(
      props.parentId || null,
      mappedComments,
      commentsPosts?.pages.flat() || []
    );

    return orderBy(uniqBy(combinedComments, "id"), "created_at", "desc");
  };

  const {
    data: commentsPosts,
    error: commentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommentLoading,
    isSuccess: isCommentSuccess,
  } = useInfiniteQuery({
    queryKey: ["comments-posts", { postId: props.postId, currentType: 'comment' }],
    queryFn: fetchCommentsData,
    enabled: props.postId != null && props.currentType === "comment",
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < limit ? undefined : allPages.length * limit,
    initialPageParam: 0,
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
      data: isCommentSuccess ? commentsPosts?.pages.flat() || [] : [],
      isLoading: isCommentLoading,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    },
  };
};

export default useComments;
