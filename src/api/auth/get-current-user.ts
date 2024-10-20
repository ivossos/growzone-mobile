import { authApi } from '@/lib/axios';
import { User } from '../@types/models';

export async function getCurrentAuthUser() {
  const response = await authApi.get<User>('/user/');
  return response.data;
}