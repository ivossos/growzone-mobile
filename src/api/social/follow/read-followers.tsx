import { socialApi } from '@/lib/axios';
import { Follower } from '@/api/@types/models';

interface ReadFollowerQuery {
  id: number;
  skip?: number;
  limit?: number,
  query?: string;
}

export async function readFollowers({id, skip = 0, limit = 20, query }: ReadFollowerQuery) {
  const response = await socialApi.get<Follower[]>(`/follow/followers/${id}`, {
    params: {
      skip,
      limit,
      query: query,
    }
  });
  return response.data;
}