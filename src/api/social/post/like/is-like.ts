import { socialApi } from '@/lib/axios';
import { Like } from '@/api/@types/models';

export async function isLike(postId: number) {
  const response = await socialApi.get<Like>(`/like/${postId}`);
  return response.data;
}