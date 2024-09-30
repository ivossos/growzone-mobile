import { authApi } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';

type VerifyTokenResponse = AuthTokenResponse & {
  reset_token: string;
}

export async function verifyCode(email: string, code: string) {
  const res = await authApi.post<VerifyTokenResponse>(`/login/verify-code`, {
    email, code
  });

  return res?.data;
}