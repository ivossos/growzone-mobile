import { socialApi } from '@/lib/axios';
import { Follow } from '@/api/@types/models';

export async function isFollower(id: number) {
  const response = await socialApi.get<Follow>(`/follow/${id}`);
  return response.data;
}