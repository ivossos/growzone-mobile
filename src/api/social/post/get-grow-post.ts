import { socialApi } from '@/lib/axios';
import { GrowPostDetail } from '@/api/@types/models';

export async function getGrowPost(id: number) {
  const response = await socialApi.get<GrowPostDetail>(`/detailed-grow-post/${id}`);
  return response.data;
}