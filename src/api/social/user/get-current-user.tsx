import { socialApi } from '@/lib/axios';
import { UserSocial } from '@/api/@types/models';

export async function getCurrentUser() {
  const response = await socialApi.get<UserSocial>('/user/');
  return response.data;
}