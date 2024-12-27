import { socialApi } from '@/lib/axios';

export async function deleteComment(commentId: number) {
  const response = await socialApi.delete<Comment>(`/comment/${commentId}`);
  return response.data;
}