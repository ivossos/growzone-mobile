import { socialApi } from '@/lib/axios';
import { Review, SocialPost } from '@/api/@types/models';

interface GetUserPostsProps {
  id: number;
  skip?: number;
  limit?: number
}

export async function getUserReelsPosts({id, skip = 0, limit = 20}: GetUserPostsProps) {
  const response = await socialApi.get<SocialPost[]>(`/listed-reel-post/${id}?skip=${skip}&limit=${limit}`);
  return response.data;
}