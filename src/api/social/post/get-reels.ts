import { socialApi } from '@/lib/axios';
import { ReelsDetail } from '@/api/@types/models';

interface GetReelsProps {
  page?: number;
  size?: number
}

export async function getReels({ page = 0, size = 20 }: GetReelsProps) {
  const response = await socialApi.get<ReelsDetail[]>(`/feed-reel-post/`, {
    params: {
      skip: page,
      limit: size
    }
  });

  return response.data;
}