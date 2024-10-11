import { socialApi } from '@/lib/axios';
import { SocialPost } from '@/api/@types/models';

interface GetTrendingWellsProps {
  page?: number;
  size?: number
}

export async function getTrendingWells({ page = 0, size = 20 }: GetTrendingWellsProps) {
  const response = await socialApi.get<SocialPost[]>('/trending-reel-post/', {
    params: {
      skip: page,
      limit: size
    }
  });

  return response.data;
}