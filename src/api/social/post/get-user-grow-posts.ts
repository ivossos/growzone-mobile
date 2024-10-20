import { socialApi } from '@/lib/axios';
import { GrowPost } from '@/api/@types/models';

interface GetUserGrowPostsProps {
  id: number;
  skip?: number;
  limit?: number
}

export async function getUserGrowPosts({id, skip = 0, limit = 20}: GetUserGrowPostsProps) {
  const response = await socialApi.get<GrowPost[]>(`/listed-grow-post/${id}?skip=${skip}&limit=${limit}`);
  return response.data;
}
