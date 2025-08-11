import { authDevApi } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';

export interface AccessTokenBody {
  username: string;
  password: string;
}

export async function accessToken(
  { username, password }: AccessTokenBody
): Promise<AuthTokenResponse> {
  const url = `${authDevApi.defaults.baseURL}/login/access-token`;

  const data = new URLSearchParams();
  data.append('grant_type', 'password');
  data.append('username', username);
  data.append('password', password);

  try {
    const res = await authDevApi.post<AuthTokenResponse>(
      '/login/access-token',
      data,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return res.data;
  } catch (err: any) {
    console.error('❌ accessToken error:', err.toJSON ? err.toJSON() : err);
    throw err;
  }
}
