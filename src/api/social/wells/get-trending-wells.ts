import { socialApi } from '@/lib/axios';
import { SocialPost } from '@/api/@types/models';

interface GetTrendingWellsProps {
  skip?: number;
  limit?: number
}

export async function getTrendingWells({ skip = 0, limit = 20 }: GetTrendingWellsProps) {
  const response = await socialApi.get<SocialPost[]>('/trending-reel-post/', {
    params: {
      skip,
      limit
    }
  });

  return response.data;
}