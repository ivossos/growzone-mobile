import { authApi } from '@/lib/axios';

export interface VerifyCodeBody {
  email: string;
  code: string;
}

export async function verifyCode({ 
  email,
  code,
}: VerifyCodeBody) {
  const response = await authApi.post('/user/verify-code', { 
    email,
    code
  });

  return response.data;
}