import { socialApi } from '@/lib/axios';
import { Following } from '@/api/@types/models';

interface ReadFollowingQuery {
  id: number;
  skip?: number;
  limit?: number;
  query?: string;
}

export async function readFollowing({id, skip = 0, limit = 20, query }: ReadFollowingQuery) {
  const response = await socialApi.get<Following[]>(`/follow/following/${id}`, {
    params: {
      skip,
      limit,
      query
    }
  });
  return response.data;
}