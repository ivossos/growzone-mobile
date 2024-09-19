import { api } from '@/lib/axios';
import { User } from '../@types/models';

export async function getCurrentUser() {
  const response = await api.get<User>('/user/');
  return response.data;
}