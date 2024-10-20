import { socialApi } from '@/lib/axios';
import { Genetic } from '@/api/@types/models';

interface CreateGeneticBody {
  name: string;
}

export async function createGenetic({ name }: CreateGeneticBody) {
  const response = await socialApi.post<Genetic>(`/strain`, {
    name
  });
  return response.data;
}