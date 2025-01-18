import { socialApi } from "@/lib/axios";
import { CreateGenetic, Genetic } from "@/api/@types/models";

export async function createGenetic(data: CreateGenetic) {
  const response = await socialApi.post<Genetic>(`/strain/`, {
    ...data,
  });
  return response.data;
}
