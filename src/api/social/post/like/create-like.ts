import { socialApi } from '@/lib/axios';
import { Like } from '@/api/@types/models';

export async function createLike(postId: number) {
  const response = await socialApi.post<Like>(`/like/${postId}`);
  return response.data;
}