import { socialApi } from '@/lib/axios';


export async function deletePost(postId: number) {
  await socialApi.delete(`/post/${postId}`);
}