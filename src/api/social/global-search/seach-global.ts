import { socialApi } from '@/lib/axios';
import { GlobalSearchResponse } from '@/api/@types/models';

interface SearchGlobalQuery {
  skip?: number;
  limit?: number;
  query?: string;
}

export async function searchGlobal({ skip = 0, limit = 20, query }: SearchGlobalQuery) {
  const response = await socialApi.get<GlobalSearchResponse[]>('/global-research/', {
    params: {
      skip,
      limit,
      query: query,
    }
  });

  return response.data;
}