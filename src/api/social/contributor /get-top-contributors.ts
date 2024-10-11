import { socialApi } from '@/lib/axios';
import { UserDTO } from '@/api/@types/models';

interface GetTopContributorsProps {
  page?: number;
  size?: number
}

export async function getTopContributors({ page = 0, size = 20 }: GetTopContributorsProps) {
  const response = await socialApi.get<UserDTO[]>('/top-contributor/', {
    params: {
      skip: page,
      limit: size
    }
  });
  return response.data;
}