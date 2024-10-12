import { socialApi } from '@/lib/axios';
import { ReelsDetail } from '@/api/@types/models';

export async function getReel(id: number) {
  const response = await socialApi.get<ReelsDetail>(`/detailed-reel-post/${id}`);
  return response.data;
}