import { socialApi } from '@/lib/axios';
import { Phase } from '@/api/@types/models';

interface Props {
  query?: string;
  skip?: number;
  limit?: number
}

export async function getPhases({query, skip = 0, limit = 20}: Props) {
  const response = await socialApi.get<Phase[]>(`/phase/`, {
    params: {
      skip,
      limit,
      query,
    }
  });
  return response.data;
}
