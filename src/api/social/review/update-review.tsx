import { socialApi } from '@/lib/axios';
import { ReadReview } from '@/api/@types/models';

interface UpdateReviewBody {
  id: number; 
  rate: number; 
  description: string;
}

export async function updateReview({ id, rate, description }: UpdateReviewBody) {
  const response = await socialApi.put<ReadReview>(`/review/${id}`, {
    value: rate,
    content: description
  });
  return response.data;
}