import { socialApi } from '@/lib/axios';
import { Lead } from '@/api/@types/models';

export async function getLead() {
  const response = await socialApi.get<Lead>('/lead/');
  return response.data;
}
