import { socialApi } from '@/lib/axios';
import { ReadReview } from '@/api/@types/models';

interface CreateReviewBody {
  userId: number; 
  rate: number; 
  description: string;
}

export async function createReview({ userId, rate, description }: CreateReviewBody) {
  const response = await socialApi.post<ReadReview>(`/review/${userId}`, {
    value: rate,
    content: description
  });
  return response.data;
}