import { socialApi } from '@/lib/axios';
import { Comment } from '@/api/@types/models';

interface GetPostCommentsProps {
  postId: number;
  parentId?: number;
  page?: number;
  size?: number
}

export async function getPostComments({ postId, parentId, page = 0, size = 100 }: GetPostCommentsProps) {
  const response = await socialApi.get<Comment[]>(`/listed-comment/${postId}`, {
    params: {
      parent_id: parentId, 
      skip: page, 
      limit: size 
    }
  });
  return response.data;
} 

