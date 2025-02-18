import { PostType } from "@/api/@types/enums";
import { GrowPostDetail, PostDetail, ReelsDetail } from "@/api/@types/models";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { getPosts } from "@/api/social/post/get-posts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createVideoPlayer } from "expo-video";
import { uniqBy } from "lodash";
import Toast from "react-native-toast-message";

const useHome = () => {
  const limit = 10;


  const fetchPostsData = async ({ pageParam = 0 }: any) => {
    const posts = await getPosts({
      limit,
      skip: pageParam,
      types: [PostType.GROW_POST, PostType.SOCIAL_POST, PostType.WEEDZ_POST],
    });

    const postsMap = posts.map((post, postIndex) => {
      if (post.type === PostType.WEEDZ_POST) {
        (post.post as ReelsDetail).file.player = createVideoPlayer({
          uri: (post.post as ReelsDetail).file?.file,
          metadata: {
            title: `title-video-${postIndex}`,
            artist: `artist-video-${postIndex}`,
          },
        });

        Object.assign((post.post as ReelsDetail).file.player, {
          loop: true,
          muted: false,
          timeUpdateEventInterval: 2,
          volume: 1.0,
        });
      } else {
        (post.post as GrowPostDetail | PostDetail).files = (
          post.post as GrowPostDetail | PostDetail
        ).files.map((file, fileIndex) => {
          if (file.type === "video") {
            const player = createVideoPlayer({
              uri: file.file,
              metadata: {
                title: `title-video-${fileIndex}`,
                artist: `artist-video-${fileIndex}`,
              },
            });

            Object.assign(player, {
              loop: true,
              muted: false,
              timeUpdateEventInterval: 2,
              volume: 1.0,
            });

            return { ...file, player };
          }
          return file;
        });
      }

      return post;
    });
    return postsMap
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
      data: isPostsSuccess ? uniqBy(postsData.pages.flat(), 'post.post_id')  : [],
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
