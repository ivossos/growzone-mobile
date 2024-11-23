import { socialApi } from '@/lib/axios';
import { UserSocial } from '@/api/@types/models';

export interface UpdateUsertBody {
  name?: string | null;
  username?: string;
  email?: string;
  biography?: string;
  document?: string;
  date_of_birth?: string;
  phone?: string;
  password?: string;
  category_id?: number;
}

export async function updateUser({ 
  name,
  username,
  email,
  biography,
  document,
  date_of_birth,
  phone,
  password,
  category_id,
}: UpdateUsertBody) {
  const response = await socialApi.put<UserSocial>('/user/', { 
    name,
    username,
    email,
    biography,
    document,
    date_of_birth,
    phone,
    password,
    category_id,
  });

  return response.data;
}