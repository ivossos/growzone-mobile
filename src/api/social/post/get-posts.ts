import { socialApi } from "@/lib/axios";
import { FeedAllPost } from "@/api/@types/models";
import { PostType } from "@/api/@types/enums";

interface GetPostsProps {
  skip?: number;
  limit?: number;
  types?: Array<PostType>;
}

export async function getPosts({
  skip = 0,
  limit = 20,
  types = [PostType.GROW_POST, PostType.SOCIAL_POST],
}: GetPostsProps) {
  const response = await socialApi.get<FeedAllPost[]>(`/feed-post/`, {
    params: {
      skip,
      limit,
      types,
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      if (params.types) {
        params.types.forEach((type: PostType) => searchParams.append('types', type));
      }
      searchParams.append('skip', params.skip);
      searchParams.append('limit', params.limit);
      
      return searchParams.toString();
    },
  });

  return response.data;
}
