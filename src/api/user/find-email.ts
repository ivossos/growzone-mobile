import { api } from '@/lib/axios';
import { DefaultResponse } from '../@types/models';


export async function findEmail(email: string) {
  const response = await api.get<DefaultResponse>('/user/find-email/', {
    params: {
      email: email
    }
  });
  return response.data;
}