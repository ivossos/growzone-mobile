import { socialApi } from '@/lib/axios';
import { PostDetail } from '@/api/@types/models';

export async function getPost(id: number) {
  const response = await socialApi.get<PostDetail>(`/detailed-social-post/${id}`);
  return response.data;
}