import { socialApi } from '@/lib/axios';
import { PostLike } from '@/api/@types/models';

interface GetPostLikesProps {
  postId: number;
  skip?: number;
  limit?: number
}

export async function getPostLikes({ postId, skip = 0, limit = 20 }: GetPostLikesProps) {
  const response = await socialApi.get<PostLike[]>(`/like/likes/${postId}`, {
    params: {
      skip, 
      limit
    }
  });
  return response.data;
} 

