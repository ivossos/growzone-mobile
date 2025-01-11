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
import { useMemo } from "react";
import Toast from "react-native-toast-message";

const useTimeline = (props: Omit<TimelineParams, "limit" | "skip">) => {
  const limit = 10;

  const findAllWeedzPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<ReelsDetail>> => {
    const weedzPosts = await getAllWeedzPost(params);

    return weedzPosts.map((weedzPost, index) => {
      if (weedzPost.file.type === "image") {
        return weedzPost;
      }

      const player = createVideoPlayer({
        uri: weedzPost.file.file,
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
  };

  const findAllSocialPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<PostDetail>> => {
    const socialPosts = await getAllSocialPost(params);

    const socialPostsMap = socialPosts.map((socialPost) => {
      const files = socialPost.files.map((file, index) => {
        if (file.type === "image") {
          return file;
        }

        const player = createVideoPlayer({
          uri: file.file,
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

    return socialPostsMap;
  };

  const findAllGrowPost = async (
    params: Pick<TimelineParams, "limit" | "userId" | "skip">
  ): Promise<Array<GrowPostDetail>> => {
    const growPosts = await getAllGrowPost(params);

    const growPostsMap = growPosts.map((growPost) => {
      const files = growPost.files.map((file, index) => {
        if (file.type === "image") {
          return file;
        }

        const player = createVideoPlayer({
          uri: file.file,
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

    return growPostsMap;
  };

  const fetchData = async ({ pageParam = 0, queryKey }: any) => {
    const [_, params] = queryKey as [any, TimelineParams];
    const typeValue = params.type;

    console.log('params ', { ...params, pageParam });
    

    const handlers = {
      [TimelineType.SOCIAL]: () =>
        findAllSocialPost({ ...params, skip: pageParam }),
      [TimelineType.WEEDZ]: () =>
        findAllWeedzPost({ ...params, skip: pageParam }),
      [TimelineType.GROW]: () =>
        findAllGrowPost({ ...params, skip: pageParam }),
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
    queryKey: ["timeline", props],
    queryFn: fetchData,
    enabled: props.userId != null,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });

  // const loadUntilIndex = async (index: number) => {
  //   const requiredPages = Math.ceil((index + 1) / defaultLimit);
  //   for (let i = 0; i < requiredPages; i++) {
  //     if (hasNextPage) {
  //       await fetchNextPage();
  //     }
  //   }
  // };

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
    refetch,
    isRefetching,
  };
};

export default useTimeline;
