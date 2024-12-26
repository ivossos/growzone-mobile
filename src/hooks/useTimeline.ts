import { TimelineType } from "@/api/@types/enums";
import { TimelineParams } from "@/api/@types/models";
import { getAllGrowPost } from "@/api/social/post/timeline/get-all-grow-post";
import { getAllSocialPost } from "@/api/social/post/timeline/get-all-social-post";
import { getAllWeedzPost } from "@/api/social/post/timeline/get-all-weedz-post";
import { useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

const useTimeline = (props: Omit<TimelineParams, 'limit' | 'skip'>) => {
  const limit = 10;

  const fetchData = async ({ pageParam = 0, queryKey }: any) => {
    const [_, params] = queryKey as [any, TimelineParams];

    const typeValue = params.type;

    console.log('fetchData ', {
      ...queryKey,
      pageParam
    });
    

    const handlers = {
      [TimelineType.SOCIAL]: () =>
        getAllSocialPost({ ...params, skip: pageParam, limit }),
      [TimelineType.WEEDZ]: () =>
        getAllWeedzPost({ ...params, skip: pageParam, limit }),
      [TimelineType.GROW]: () =>
        getAllGrowPost({ ...params, skip: pageParam, limit }),
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
    queryKey: ["timeline", props],
    queryFn: fetchData,
    enabled: !!props?.userId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  if (error) {
    console.error("Erro ao carregar a timeline: ", error);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao abrir a timeline. Tente novamente mais tarde.",
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

export default useTimeline