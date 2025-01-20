import { GrowPostDetail, PostDetail, ReelsDetail } from "@/api/@types/models";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";
import { getPosts } from "@/api/social/post/get-posts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createVideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";

const useHome = () => {
  const limit = 10;

  const teste: any = [
    {
      type: "reel",
      post: {
        id: 354,
        post_id: 1012,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        file: {
          id: 224,
          file: "https://dev.img.growzone.co/media/reel_post_files/1b999ab9-67cd-48a9-8da5-d18718e7add6/output.m3u8",
          type: "video",
          created_at: "2025-01-20T08:06:59.529472+00:00",
        },
        description: "Teste",
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-20T08:06:42.278751+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 417,
        post_id: 1008,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 480,
            file: "https://dev.img.growzone.co/media/social_post_files/8f2e9a1e-8d4d-4b8a-b4fa-87a21d1da6e6.webp",
            type: "image",
            created_at: "2025-01-20T06:55:16.709089+00:00",
          },
        ],
        description: null,
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-20T06:55:16.701988+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 415,
        post_id: 1002,
        user: {
          id: 135,
          image: {
            id: 114,
            image:
              "https://dev.img.growzone.co/media/user_images/4e0cecc6-2132-4f99-a023-e4de8c26fc5e.webp",
            created_at: "2025-01-17T16:04:12.107830+00:00",
          },
          name: null,
          username: "kamara",
          created_at: "2024-11-15T18:46:27.882387+00:00",
          is_following: true,
        },
        files: [
          {
            id: 477,
            file: "https://dev.img.growzone.co/media/social_post_files/783c447f-4bc1-4e4b-a00c-632e35aa3b04.webp",
            type: "image",
            created_at: "2025-01-19T14:11:03.440227+00:00",
          },
          {
            id: 478,
            file: "https://dev.img.growzone.co/media/social_post_files/9a559b33-6839-4b16-bd0f-521427c0f519/output.m3u8",
            type: "video",
            created_at: "2025-01-19T14:29:44.402185+00:00",
          },
        ],
        description: null,
        like_count: 1,
        comment_count: 0,
        created_at: "2025-01-19T14:11:03.433832+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "reel",
      post: {
        id: 346,
        post_id: 999,
        user: {
          id: 71,
          image: {
            id: 78,
            image:
              "https://dev.img.growzone.co/media/user_images/90f0d201-e509-4134-9ecb-8ac0976fd50a.webp",
            created_at: "2024-12-02T14:54:26.478838+00:00",
          },
          name: "Diego",
          username: "diego",
          created_at: "2024-11-02T14:42:06.817316+00:00",
          is_following: true,
        },
        file: {
          id: 217,
          file: "https://dev.img.growzone.co/media/reel_post_files/fe3f10aa-202a-4cb2-a580-63c0bec048ac/output.m3u8",
          type: "video",
          created_at: "2025-01-19T11:08:51.335429+00:00",
        },
        description: "Gordão da Sadhu na Expo Postos.",
        like_count: 2,
        comment_count: 0,
        created_at: "2025-01-19T11:07:17.177036+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "grow",
      post: {
        id: 217,
        post_id: 998,
        user: {
          id: 71,
          image: {
            id: 78,
            image:
              "https://dev.img.growzone.co/media/user_images/90f0d201-e509-4134-9ecb-8ac0976fd50a.webp",
            created_at: "2024-12-02T14:54:26.478838+00:00",
          },
          name: "Diego",
          username: "diego",
          created_at: "2024-11-02T14:42:06.817316+00:00",
          is_following: true,
        },
        files: [
          {
            id: 259,
            file: "https://dev.img.growzone.co/media/grow_post_files/dfcb42df-6016-425b-9fcd-893b42541785.webp",
            type: "image",
            created_at: "2025-01-19T11:00:50.687031+00:00",
          },
        ],
        strain: {
          id: 1252,
          name: "Northern Lights",
          created_at: "2024-10-11T03:06:02.985347+00:00",
        },
        phase: {
          id: 6,
          name: "Floração",
          created_at: "2024-10-12T00:51:08.965027+00:00",
        },
        day: 69,
        description: "🍁💚",
        like_count: 4,
        comment_count: 0,
        created_at: "2025-01-19T11:00:50.678643+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 412,
        post_id: 995,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 474,
            file: "https://dev.img.growzone.co/media/social_post_files/ed87dd28-b5a2-4467-89f8-6cbec89edfdc.webp",
            type: "image",
            created_at: "2025-01-18T20:50:46.512992+00:00",
          },
        ],
        description: null,
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-18T20:50:46.506379+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 411,
        post_id: 994,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 473,
            file: "https://dev.img.growzone.co/media/social_post_files/b18a2553-94b2-4322-bea6-e11ccc041edf.webp",
            type: "image",
            created_at: "2025-01-18T20:50:31.834615+00:00",
          },
        ],
        description: null,
        like_count: 1,
        comment_count: 0,
        created_at: "2025-01-18T20:50:31.829164+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 410,
        post_id: 993,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 472,
            file: "https://dev.img.growzone.co/media/social_post_files/fa276ac3-cef8-420a-8bce-41abdfea1ba3.webp",
            type: "image",
            created_at: "2025-01-18T20:50:23.549341+00:00",
          },
        ],
        description: null,
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-18T20:50:23.542109+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 409,
        post_id: 992,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 471,
            file: "https://dev.img.growzone.co/media/social_post_files/69fe8ede-5909-4d26-b5f5-8d29f10c5656.webp",
            type: "image",
            created_at: "2025-01-18T20:50:14.667142+00:00",
          },
        ],
        description: null,
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-18T20:50:14.660653+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
    {
      type: "social",
      post: {
        id: 408,
        post_id: 991,
        user: {
          id: 314,
          image: {
            id: 83,
            image:
              "https://dev.img.growzone.co/media/user_images/dda190bd-19f4-4dbd-922a-ff832793c5ce.webp",
            created_at: "2024-12-11T13:35:01.001686+00:00",
          },
          name: null,
          username: "brandon.kluck",
          created_at: "2024-12-04T22:41:43.668049+00:00",
          is_following: false,
        },
        files: [
          {
            id: 470,
            file: "https://dev.img.growzone.co/media/social_post_files/44500b97-9156-4b88-aabb-66d6aac61d94.webp",
            type: "image",
            created_at: "2025-01-18T20:50:03.994490+00:00",
          },
        ],
        description: null,
        like_count: 0,
        comment_count: 0,
        created_at: "2025-01-18T20:50:03.986832+00:00",
        is_liked: false,
        is_viewed: false,
        is_compressing: false,
      },
    },
  ];

  const fetchPostsData = async ({ pageParam = 0 }: any) => {
    const posts = teste;

    return posts.map((post, postIndex) => {
      if (post.type === "reel") {
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
