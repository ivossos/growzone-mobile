import { api } from '@/lib/axios';
import { DefaultResponse } from '../@types/models';


export async function findUsername(username: string) {
  const response = await api.get<DefaultResponse>('/user/find-username/', {
    params: {
      username: username
    }
  });
  return response.data;
}