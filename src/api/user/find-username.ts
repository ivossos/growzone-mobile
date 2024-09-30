import { authApi } from '@/lib/axios';
import { DefaultResponse } from '../@types/models';


export async function findUsername(username: string) {
  const response = await authApi.get<DefaultResponse>('/user/find-username/', {
    params: {
      username: username
    }
  });
  return response.data;
}