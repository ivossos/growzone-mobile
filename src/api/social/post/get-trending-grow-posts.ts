import { socialApi } from '@/lib/axios';
import { GrowPost, SocialPost } from '@/api/@types/models';
import { RESULT_PHASE } from '@/constants';

interface GetTrendingGrowPostsProps {
  skip?: number;
  limit?: number;
  phase_id?: number;
}

export async function getTrendingGrowPosts({ skip = 0, limit = 20, phase_id = RESULT_PHASE.id }: GetTrendingGrowPostsProps) {
  const response = await socialApi.get<GrowPost[]>('/trending-grow-post/', {
    params: {
      skip,
      limit,
      phase_id
    }
  });

  return response.data;
}