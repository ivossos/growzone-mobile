import { api } from '@/lib/axios';
import { AuthTokenResponse } from '../@types/models';


export async function recoverPassword(email: string) {
  const res = await api.post<AuthTokenResponse>(`/login/recover-password/${email}`);

  return res?.data;
}