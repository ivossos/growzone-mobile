import { socialApi } from '@/lib/axios';
import { PostLike } from '@/api/@types/models';

interface GetPostLikesProps {
  postId: number;
  query?: string;
  skip?: number;
  limit?: number
}

export async function getPostLikes({ postId, skip = 0, limit = 20, query }: GetPostLikesProps) {
  const response = await socialApi.get<PostLike[]>(`/like/likes/${postId}`, {
    params: {
      skip, 
      limit,
      query
    }
  });
  return response.data;
} 

