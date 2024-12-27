import { socialApi } from '@/lib/axios';
import { Comment, GetPostCommentsProps } from '@/api/@types/models';

export async function getPostComments({ postId, parentId, skip = 0, limit = 20 }: GetPostCommentsProps) {
  const response = await socialApi.get<Comment[]>(`/listed-comment/${postId}`, {
    params: {
      parent_id: parentId, 
      skip, 
      limit
    }
  });
  return response.data;
} 

