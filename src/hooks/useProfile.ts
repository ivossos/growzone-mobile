import { TimelineType } from "@/api/@types/enums";
import { TimelineParams } from "@/api/@types/models";
import { getUserGrowPosts } from "@/api/social/post/get-user-grow-posts";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import { getUserReelsPosts } from "@/api/social/post/get-user-reels-posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const useProfile = (props: { userId: number, type: TimelineType }) => {
  const limit = 10;

  const fetchData = async ({ pageParam = 0, queryKey }: any) => {
    const [_, params] = queryKey as [any, TimelineParams];

    const typeValue = params.type;

    const paramsValue = {
      id: params.userId,
      skip: pageParam,
      limit,
    };

    const handlers = {
      [TimelineType.SOCIAL]: () => getUserPosts(paramsValue),
      [TimelineType.WEEDZ]: () => getUserReelsPosts(paramsValue),
      [TimelineType.GROW]: () => getUserGrowPosts(paramsValue),
    };

    const handler = handlers[typeValue as TimelineType];
    if (!handler) {
      throw new Error("Tipo de timeline desconhecida");
    }

    return await handler();
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: [`profile-posts`, props],
    queryFn: fetchData,
    enabled: !!props?.userId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  if (error) {
    console.error("Erro ao carregar os posts: ", error);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao carregar os posts. Tente novamente mais tarde.",
    });
  }

  return {
    data: isSuccess ? data.pages.flat() : [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export default useProfile;
