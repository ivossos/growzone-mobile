import { socialApi } from '@/lib/axios';
import { Follow } from '@/api/@types/models';

export async function deleteFollow(id: number) {
  const response = await socialApi.delete<Follow>(`/follow/${id}`);
  return response.data;
}