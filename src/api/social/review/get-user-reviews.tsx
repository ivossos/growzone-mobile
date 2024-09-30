import { socialApi } from '@/lib/axios';
import { Review } from '@/api/@types/models';

interface GetUserReviewsProps {
  id: number;
  page?: number;
  size?: number
}

export async function getUserReviews({id, page = 0, size = 100}: GetUserReviewsProps) {
  const response = await socialApi.get<Review[]>(`/review/reviews/${id}?skip=${page}&limit=${size}`);
  return response.data;
}