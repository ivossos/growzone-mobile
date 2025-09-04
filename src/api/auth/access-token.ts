import Constants from "expo-constants";
import { authApi } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';

export interface AccessTokenBody {
  username: string;
  password: string;
}

export async function accessToken(
  { username, password }: AccessTokenBody
): Promise<AuthTokenResponse> {
  const extra = Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
  const AUTH_API_URL = extra.AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
  const url = `${AUTH_API_URL}/login/access-token`;

  const data = new URLSearchParams();
  data.append("grant_type", "password");
  data.append("username", username);
  data.append("password", password);

  try {
    const res = await authApi.post<AuthTokenResponse>(
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
