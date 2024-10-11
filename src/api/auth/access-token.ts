import { authApi } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';

export interface AccessTokenBody {
  username: string;
  password: string;
}

export async function accessToken({ 
  username,
  password,
}: AccessTokenBody) {
  const data = new URLSearchParams();
  data.append('grant_type', 'password');
  data.append('username', username);
  data.append('password', password);

  const res = await authApi.post<AuthTokenResponse>('/login/access-token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return res?.data;
}