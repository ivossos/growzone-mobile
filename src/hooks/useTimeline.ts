import { TimelineType } from "@/api/@types/enums";
import {
  GrowPostDetail,
  PostDetail,
  ReelsDetail,
  TimelineParams,
} from "@/api/@types/models";
import { getAllGrowPost } from "@/api/social/post/timeline/get-all-grow-post";
import { getAllSocialPost } from "@/api/social/post/timeline/get-all-social-post";
import { getAllWeedzPost } from "@/api/social/post/timeline/get-all-weedz-post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createVideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";

const useTimeline = (props: Omit<TimelineParams, "limit" | "skip">) => {
  const limit = 10;

  const findAllWeedzPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<ReelsDetail>> => {
    let weedzPosts = await getAllWeedzPost(params);

    if (props.loadVideoPlayer) {
      weedzPosts = weedzPosts.map((weedzPost, index) => {
        if (weedzPost.file.type === "image") {
          return weedzPost;
        }

        const player = createVideoPlayer({
          metadata: {
            title: `title-weedz-${index}`,
            artist: `artist-weedz-${index}`,
          },
        });

        player.loop = true;
        player.muted = false;
        player.timeUpdateEventInterval = 2;
        player.volume = 1.0;

        weedzPost.file.player = player;

        return {
          ...weedzPost,
          player,
        };
      });
    }

    return weedzPosts;
  };

  const findAllSocialPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<PostDetail>> => {
    let socialPosts = await getAllSocialPost(params);

    if (props.loadVideoPlayer) {
      socialPosts = socialPosts.map((socialPost) => {
        const files = socialPost.files.map((file, index) => {
          if (file.type === "image") {
            return file;
          }

          const player = createVideoPlayer({
            metadata: {
              title: `title-social-post-${index}`,
              artist: `artist-social-post-${index}`,
            },
          });

          player.loop = true;
          player.muted = false;
          player.timeUpdateEventInterval = 2;
          player.volume = 1.0;

          return {
            ...file,
            player,
          };
        });

        return {
          ...socialPost,
          files,
        };
      });
    }

    return socialPosts;
  };

  const findAllGrowPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<GrowPostDetail>> => {
    let growPosts = await getAllGrowPost(params);

    if (props.loadVideoPlayer) {
      growPosts = growPosts.map((growPost) => {
        const files = growPost.files.map((file, index) => {
          if (file.type === "image") {
            return file;
          }

          const player = createVideoPlayer({
            metadata: {
              title: `title-grow-post-${index}`,
              artist: `artist-grow-post-${index}`,
            },
          });

          player.loop = true;
          player.muted = false;
          player.timeUpdateEventInterval = 2;
          player.volume = 1.0;

          return {
            ...file,
            player,
          };
        });

        return {
          ...growPost,
          files,
        };
      });
    }

    return growPosts;
  };

  const fetchData = async ({ pageParam = 0, queryKey }: any) => {
    const [_, userId, type] = queryKey as [any, number, TimelineType];
    const typeValue = type;

    const params = {
      userId,
      type,
    };

    const handlers = {
      [TimelineType.SOCIAL]: () =>
        findAllSocialPost({ ...params, skip: pageParam, limit }),
      [TimelineType.WEEDZ]: () =>
        findAllWeedzPost({ ...params, skip: pageParam, limit }),
      [TimelineType.GROW]: () =>
        findAllGrowPost({ ...params, skip: pageParam, limit }),
    };

    const handler = handlers[typeValue];
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
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["timeline", props.userId, props.type],
    queryFn: fetchData,
    enabled: props.userId != null,
    refetchOnMount: false,
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
        "Aconteceu um erro ao exibir os posts. Tente novamente mais tarde.",
    });
  }

  return {
    data: isSuccess ? data.pages.flat() : [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  };
};

export default useTimeline;
