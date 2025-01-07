import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { getPosts } from "@/api/social/post/get-posts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createVideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";

const useHome = () => {
  const limit = 10;

  const fetchPostsData = async ({ pageParam = 0 }: any) => {
    const data = await getPosts({ skip: pageParam, limit });

    const postsFilter = data.filter((post) => post.type !== "reel");

    const postsWithPlayers = postsFilter.map((post) => {
      const postData = post;

      const filesPost = post.post.files.map((file, index) => {
        if (file.type === "video") {
          const player = createVideoPlayer({
            uri: file.file,
            metadata: {
              title: `title-video-${index}`,
              artist: `artist-video-${index}`,
            },
          })

          player.loop = true
          player.muted = false
          player.timeUpdateEventInterval = 2
          player.volume = 1.0

          return {
            ...file,
            player,
          };
        }
        return file;
      });

      postData.post.files = filesPost;

      return postData;
    });

    return postsWithPlayers;
  };

  const fetchTopContributors = async () => {
    return await getTopContributors({});
  };

  const {
    data: postsData,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
  } = useInfiniteQuery({
    queryKey: ["home-posts"],
    queryFn: fetchPostsData,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  const {
    data: contributorsData,
    error: contributorsError,
    isLoading: isContributorsLoading,
    isSuccess: isContributorsSuccess,
  } = useQuery({
    queryKey: ["top-contributors"],
    queryFn: fetchTopContributors,
  });

  if (postsError || contributorsError) {
    console.error(
      "Erro ao carregar os dados: ",
      postsError || contributorsError
    );
    Toast.show({
      type: "error",
      text1: "Opss",
      text2:
        "Aconteceu um erro ao carregar os dados. Tente novamente mais tarde.",
    });
  }

  return {
    posts: {
      data: isPostsSuccess ? postsData.pages.flat() : [],
      isLoading: isPostsLoading,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    },
    topContributors: {
      data: isContributorsSuccess ? contributorsData : [],
      isLoading: isContributorsLoading,
    },
  };
};

export default useHome;
