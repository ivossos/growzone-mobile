import { socialApi } from '@/lib/axios';
import { CommentLike } from '@/api/@types/models';

export async function createCommentLike(commentId: number) {
  const response = await socialApi.post<CommentLike>(`/comment-like/${commentId}`);
  return response.data;
}