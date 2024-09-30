import { socialApi } from '@/lib/axios';
import { Follow } from '@/api/@types/models';

export async function createFollow(id: number) {
  const response = await socialApi.post<Follow>(`/follow/${id}`);
  return response.data;
}