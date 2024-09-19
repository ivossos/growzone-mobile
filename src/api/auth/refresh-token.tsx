import { api } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';


export async function refreshToken(refresh_token: string) {
  const res = await api.post<AuthTokenResponse>('/login/refresh-token/', null, {
    params: {
      refresh_token: refresh_token
    }
  });

  return res?.data;
}