import { GlobalSearchType } from "@/api/@types/enums";
import { GlobalSearchParams, GrowPost } from "@/api/@types/models";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { searchGrowPost } from "@/api/social/global-search/grow-research";
import { searchGlobal } from "@/api/social/global-search/search-global";
import { getTrendingGrowPosts } from "@/api/social/post/get-trending-grow-posts";
import { getTrendingWells } from "@/api/social/wells/get-trending-wells";
import { EXTRACTIONS_PHASE, RESULT_PHASE } from "@/constants";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createVideoPlayer, VideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";

interface FilterGlobalSearch
  extends Pick<
    GlobalSearchParams,
    "phase_id" | "strain_id" | "query" | "type"
  > {
  startSearch: boolean;
}

const useFilterGlobalSearch = (props: FilterGlobalSearch) => {
  const limit = 10;

  const getAllTrendingGrowPosts = async ({
    phaseId,
  }: {
    phaseId: number;
  }): Promise<GrowPost[]> => {
    const growPosts = await getTrendingGrowPosts({ phase_id: phaseId });

    return growPosts.map((growPost, index) => {
      let fileVideo = {} as VideoPlayer;

      if (growPost.file.type === "video") {
        fileVideo = createVideoPlayer({
          uri: growPost.file.file,
          metadata: {
            title: `title-grow-post-${index}`,
            artist: `artist-grow-post-${index}`,
          },
        });

        fileVideo.loop = true;
        fileVideo.muted = false;
        fileVideo.timeUpdateEventInterval = 2;
        fileVideo.volume = 1.0;
      }

      return {
        ...growPost,
        file: {
          ...growPost.file,
          player: fileVideo,
        },
      };
    });
  };

  const fetchGlobalSearch = async ({ pageParam = 0, queryKey }: any) => {
    const [_, params] = queryKey;

    const typeValue = params?.type ? params.type : GlobalSearchType.USER;

    const searchHandlers = {
      [GlobalSearchType.USER]: () => {
        if (!params.query) {
          return [];
        }

        return searchGlobal({ ...params, skip: pageParam, limit });
      },
      [GlobalSearchType.GROW_POST]: () =>
        searchGrowPost({ ...params, skip: pageParam, limit }),
    };

    const handler = searchHandlers[typeValue as GlobalSearchType];
    if (!handler) {
      throw new Error("Tipo de pesquisa desconhecido");
    }

    return await handler();
  };

  const {
    data: globalInitialData,
    isLoading: isLoadingGlobalInitial,
    isSuccess: isSuccessGlobalInitial,
    error: errorInitialHomeSearch,
  } = useQuery({
    queryKey: ["search-global-initial-page"],
    queryFn: async () => {
      const [
        topContributors,
        trendingWells,
        trendingGrowPostsResults,
        trendingGrowPostsExtration,
        growPosts,
      ] = await Promise.all([
        getTopContributors({}),
        getTrendingWells({}),
        getAllTrendingGrowPosts({ phaseId: RESULT_PHASE.id }),
        getAllTrendingGrowPosts({ phaseId: EXTRACTIONS_PHASE.id }),
        searchGrowPost({ limit: 10, skip: 0 }),
      ]);

      return {
        topContributors,
        trendingWells,
        trendingGrowPostsResults,
        trendingGrowPostsExtration,
        growPosts,
      };
    },
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ["filtered-global-search", props],
    queryFn: fetchGlobalSearch,
    enabled: props.startSearch,
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  if (error) {
    console.error("Erro ao carregar a pesquisa: ", error);
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao realizar a pesquisa. Tente novamente mais tarde.",
    });
  }

  if (errorInitialHomeSearch) {
    console.error(
      "Erro ao carregar dados para exibir tela inicial de pesquisa global: ",
      errorInitialHomeSearch
    );
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao buscar as informações. Tente novamente mais tarde.",
    });
  }

  return {
    globalSearch: {
      data: isSuccess ? data.pages.flat() : [],
      error,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
    },
    homeGlobalSearch: {
      data: isSuccessGlobalInitial
        ? globalInitialData
        : {
            topContributors: [],
            trendingWells: [],
            trendingGrowPostsResults: [],
            trendingGrowPostsExtration: [],
            growPosts: [],
          },
      isLoading: isLoadingGlobalInitial,
    },
  };
};

export default useFilterGlobalSearch;
