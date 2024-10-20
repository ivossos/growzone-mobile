import { socialApi } from '@/lib/axios';
import { Genetic } from '@/api/@types/models';

interface GetGeneticsProps {
  query?: string;
  skip?: number;
  limit?: number
}

export async function getGenetics({query, skip = 0, limit = 20}: GetGeneticsProps) {
  const response = await socialApi.get<Genetic[]>(`/strain/`, {
    params: {
      skip,
      limit,
      query,
    }
  });
  return response.data;
}
