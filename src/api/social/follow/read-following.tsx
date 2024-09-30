import { socialApi } from '@/lib/axios';
import { Following } from '@/api/@types/models';

interface ReadFollowingQuery {
  id: number;
  page?: number;
  size?: number
}

export async function readFollowing({id, page = 0, size = 100}: ReadFollowingQuery) {
  const response = await socialApi.get<Following[]>(`/follow/following/${id}`, {
    params: {
      skip: page,
      limit: size
    }
  });
  return response.data;
}