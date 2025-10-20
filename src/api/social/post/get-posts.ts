import { socialApi } from "@/lib/axios";
import { FeedAllPost } from "@/api/@types/models";
import { PostType } from "@/api/@types/enums";
import { storageGetAuthToken } from "@/storage/storage-auth-token";

interface GetPostsProps {
  skip?: number;
  limit?: number;
  types?: Array<PostType>;
}

// 🧪 DEV MODE: Mock feed data for testing
const MOCK_FEED_DATA: FeedAllPost[] = [
  {
    type: PostType.SOCIAL_POST,
    post: {
      id: 1,
      post_id: 1,
      user: {
        id: 1,
        image: {
          id: 1,
          image: "https://i.pravatar.cc/150?img=10",
          created_at: new Date().toISOString(),
        },
        name: "Você",
        username: "testuser",
        created_at: new Date().toISOString(),
        is_following: false,
      },
      files: [],
      description: "🌱 Bem-vindo ao Growzone! Este é um post de teste com usuário mock.",
      like_count: 42,
      comment_count: 8,
      created_at: new Date().toISOString(),
      is_compressing: false,
      is_liked: false,
    },
  },
  {
    type: PostType.SOCIAL_POST,
    post: {
      id: 2,
      post_id: 2,
      user: {
        id: 2,
        image: {
          id: 2,
          image: "https://i.pravatar.cc/150?img=12",
          created_at: new Date().toISOString(),
        },
        name: "devuser",
        username: "devuser",
        created_at: new Date().toISOString(),
        is_following: false,
      },
      files: [],
      description: "🚀 Sistema de mock está funcionando perfeitamente! Você pode navegar pela interface sem backend.",
      like_count: 15,
      comment_count: 3,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_compressing: false,
      is_liked: true,
    },
  },
];

export async function getPosts({
  skip = 0,
  limit = 20,
  types = [PostType.GROW_POST, PostType.SOCIAL_POST],
}: GetPostsProps) {
  // 🧪 DEV MODE: Return mock data for mock users
  const __DEV_MODE__ = process.env.NODE_ENV === 'development' || __DEV__;

  if (__DEV_MODE__) {
    try {
      const { access_token } = await storageGetAuthToken();
      console.log("🔍 DEV: Checking token:", access_token ? "exists" : "null");

      if (access_token?.startsWith("mock-token-")) {
        console.warn("⚠️ DEV MODE: Returning mock feed data");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_FEED_DATA;
      }
    } catch (error) {
      console.error("⚠️ DEV MODE: Error checking token, returning mock data anyway", error);
      // Return mock data if there's any storage error
      return MOCK_FEED_DATA;
    }
  }

  const response = await socialApi.get<FeedAllPost[]>(`/feed-post/`, {
    params: {
      skip,
      limit,
      types,
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      if (params.types) {
        params.types.forEach((type: PostType) =>
          searchParams.append("types", type)
        );
      }
      searchParams.append("skip", params.skip);
      searchParams.append("limit", params.limit);

      return searchParams.toString();
    },
  });

  return response.data;
}
