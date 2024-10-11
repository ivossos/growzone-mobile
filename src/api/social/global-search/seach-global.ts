import { socialApi } from '@/lib/axios';
import { GlobalSearchResponse } from '@/api/@types/models';

interface SearchGlobalQuery {
  page?: number;
  size?: number,
  query?: string;
}

export async function searchGlobal({ page = 0, size = 100, query }: SearchGlobalQuery) {
  const response = await socialApi.get<GlobalSearchResponse[]>('/global-research/', {
    params: {
      skip: page,
      limit: size,
      query: query,
    }
  });

  return response.data;
}