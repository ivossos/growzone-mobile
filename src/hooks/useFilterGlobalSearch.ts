import { GlobalSearchType } from "@/api/@types/enums";
import { GlobalSearchParams } from "@/api/@types/models";
import { searchGrowPost } from "@/api/social/global-search/grow-research";
import { searchGlobal } from "@/api/social/global-search/search-global";
import { useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type FilterGlobalSearch = Pick<
  GlobalSearchParams,
  "phase_id" | "strain_id" | "query" | "type"
>;

const useFilterGlobalSearch = (props: FilterGlobalSearch) => {
  const limit = 10;
  const fetchGlobalSearch = async ({ pageParam = 0, queryKey }: any) => {
    const [_, params] = queryKey;

    const typeValue = params?.type ? params.type : GlobalSearchType.GROW_POST;

    const searchHandlers = {
      [GlobalSearchType.USER]: () =>
        searchGlobal({ ...params, skip: pageParam, limit }),
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
    enabled: !!props?.query,
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

  return {
    data: isSuccess ? data.pages.flat() : [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};

export default useFilterGlobalSearch;
