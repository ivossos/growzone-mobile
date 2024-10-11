import { socialApi } from '@/lib/axios';
import { Review, SocialPost } from '@/api/@types/models';

interface GetUserPostsProps {
  id: number;
  page?: number;
  size?: number
}

export async function getUserReelsPosts({id, page = 0, size = 100}: GetUserPostsProps) {
  const response = await socialApi.get<SocialPost[]>(`/listed-reel-post/${id}?skip=${page}&limit=${size}`);
  return response.data;
}