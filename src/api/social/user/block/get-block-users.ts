import { socialApi } from '@/lib/axios';
import { Blocked } from '@/api/@types/models';

interface GetBlockProps {
  query?: string;
  skip?: number;
  limit?: number;
}

export async function getBlockUsers({ skip = 0, limit = 20 }: GetBlockProps) {
  const response = await socialApi.get<Blocked[]>('/block/', {
    params: { 
      skip, 
      limit 
    }
  });
  return response.data;
}