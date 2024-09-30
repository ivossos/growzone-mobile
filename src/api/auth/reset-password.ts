import { authApi } from '@/lib/axios';
import { DefaultResponse } from '../@types/models';

export async function resetPassword(resetToken: string, newPassword: string) {
  const res = await authApi.post<DefaultResponse>('/login/reset-password', {
    reset_token: resetToken,
    new_password: newPassword
  });

  return res?.data;
}