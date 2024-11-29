import { socialApi } from '@/lib/axios';


export async function deleteAccount() {
  await socialApi.delete('/user/');
}