import { socialApi, socialDevApi } from '@/lib/axios';
import { UserCategory } from '@/api/@types/models';

interface GetUserCategoriesProps {
  page?: number;
  size?: number
}

export async function getUserCategories({ page = 0, size = 20 }: GetUserCategoriesProps) {
  const response = await socialApi.get<UserCategory[]>('/user-category/', {
    params: {
      skip: page,
      limit: size
    }
  });
  return response.data;
}