import { socialApi } from '@/lib/axios';
import { GrowPost, SocialPost } from '@/api/@types/models';

interface GetTrendingGrowPostsProps {
  skip?: number;
  limit?: number
}

export async function getTrendingGrowPosts({ skip = 0, limit = 20 }: GetTrendingGrowPostsProps) {
  const response = await socialApi.get<GrowPost[]>('/trending-grow-post/', {
    params: {
      skip,
      limit
    }
  });

  return response.data;
}