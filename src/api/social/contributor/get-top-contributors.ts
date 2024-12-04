import { socialApi } from '@/lib/axios';
import { UserDTO } from '@/api/@types/models';

interface GetTopContributorsProps {
  skip?: number;
  limit?: number
}

export async function getTopContributors({ skip = 0, limit = 20 }: GetTopContributorsProps) {
  const response = await socialApi.get<UserDTO[]>('/top-contributor/', {
    params: {
      skip,
      limit
    }
  });
  return response.data;
}