import { socialApi } from '@/lib/axios';
import { Review } from '@/api/@types/models';

interface GetUserReviewsProps {
  id: number;
  skip?: number;
  limit?: number
}

export async function getUserReviews({id, skip = 0, limit = 20}: GetUserReviewsProps) {
  const response = await socialApi.get<Review[]>(`/review/reviews/${id}?skip=${skip}&limit=${limit}`);
  return response.data;
}