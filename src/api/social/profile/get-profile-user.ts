import { socialApi } from '@/lib/axios';
import { UserProfile } from '@/api/@types/models';

export async function getProfileUser(id: number) {
  const response = await socialApi.get<UserProfile>(`/profile/${id}`);
  return response.data;
}