import { socialApi } from '@/lib/axios';
import { Like } from '@/api/@types/models';

export async function deleteLike(postId: number) {
  const response = await socialApi.delete<Like>(`/like/${postId}`);
  return response.data;
}