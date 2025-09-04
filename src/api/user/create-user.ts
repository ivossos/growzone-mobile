import { authApi } from '@/lib/axios';
import { User } from '../@types/models';

export interface CreateUsertBody {
  username: string;
  email: string;
  password: string;
}

export async function createUser({
  email,
  username,
  password,
}: CreateUsertBody) {
  const response = await authApi.post<User>('/user/', {
    email,
    username,
    password
  });
  return response.data;
}