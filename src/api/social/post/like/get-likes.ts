import { socialApi } from '@/lib/axios';
import { PostLike } from '@/api/@types/models';

interface GetPostLikesProps {
  postId: number;
  page?: number;
  size?: number
}

export async function getPostLikes({ postId, page = 0, size = 100 }: GetPostLikesProps) {
  const response = await socialApi.get<PostLike[]>(`/like/likes/${postId}`, {
    params: {
      skip: page, 
      limit: size 
    }
  });
  return response.data;
} 

