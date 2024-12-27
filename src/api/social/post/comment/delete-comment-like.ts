import { socialApi } from '@/lib/axios';
import { CommentLike } from '@/api/@types/models';

export async function deleteLikeComment(commentId: number) {
  const response = await socialApi.delete<CommentLike>(`/comment-like/${commentId}`);
  return response.data;
}