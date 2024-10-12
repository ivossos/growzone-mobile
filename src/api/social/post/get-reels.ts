import { socialApi } from '@/lib/axios';
import { ReelsDetail } from '@/api/@types/models';

interface GetReelsProps {
  skip?: number;
  limit?: number
}

export async function getReels({ skip = 0, limit = 20 }: GetReelsProps) {
  const response = await socialApi.get<ReelsDetail[]>(`/feed-reel-post/`, {
    params: {
      skip,
      limit
    }
  });

  return response.data;
}