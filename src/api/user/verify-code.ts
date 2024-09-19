import { api } from '@/lib/axios';

export interface VerifyCodeBody {
  email: string;
  code: string;
}

export async function verifyCode({ 
  email,
  code,
}: VerifyCodeBody) {
  const response = await api.post('/user/verify-code', { 
    email,
    code
  });

  return response.data;
}