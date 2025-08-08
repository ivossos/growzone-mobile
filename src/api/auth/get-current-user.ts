import { authApi } from '@/lib/axios';
import { User } from '../@types/models';

export async function getCurrentAuthUser(headers = {}) {
  const response = await authApi.get<User>('/user/', { headers });
  return response.data;
}