import { authApi } from '@/lib/axios';
import { DefaultResponse } from '../@types/models';

export interface ResendEmailCodeBody {
  email: string;
}

export async function resendEmailCode({ 
  email
}: ResendEmailCodeBody) {
  const response = await authApi.post<DefaultResponse>(`/user/resend-code/${email}`);

  return response.data;
}