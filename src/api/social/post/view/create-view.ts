import { socialApi } from '@/lib/axios';
import { View } from '@/api/@types/models';

export async function createView(postId: number) {
  const response = await socialApi.post<View>(`/view/${postId}`);
  return response.data;
}