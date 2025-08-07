import { authApi, authDevApi } from '@/lib/axios';
import { User } from '../@types/models';

export async function getCurrentAuthUser(headers = {}) {
  const response = await authDevApi.get<User>('/user/', { headers });
  return response.data;
}