import { socialApi } from '@/lib/axios';
import { ReadReview, Review } from '@/api/@types/models';


export async function readUserReview(id: number) {
  const response = await socialApi.get<ReadReview>(`/review/${id}`);
  return response.data;
}