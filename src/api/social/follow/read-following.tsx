import { socialApi } from '@/lib/axios';
import { Following } from '@/api/@types/models';

interface ReadFollowingQuery {
  id: number;
  page?: number;
  size?: number;
  query?: string;
}

export async function readFollowing({id, page = 0, size = 50, query }: ReadFollowingQuery) {
  const response = await socialApi.get<Following[]>(`/follow/following/${id}`, {
    params: {
      skip: page,
      limit: size,
      query
    }
  });
  return response.data;
}