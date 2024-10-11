import { socialApi } from '@/lib/axios';
import { Follower } from '@/api/@types/models';

interface ReadFollowerQuery {
  id: number;
  page?: number;
  size?: number,
  query?: string;
}

export async function readFollowers({id, page = 0, size = 100, query }: ReadFollowerQuery) {
  const response = await socialApi.get<Follower[]>(`/follow/followers/${id}`, {
    params: {
      skip: page,
      limit: size,
      query: query,
    }
  });
  return response.data;
}