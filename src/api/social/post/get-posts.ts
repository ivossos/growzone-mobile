import { socialApi } from '@/lib/axios';
import { PostDetail } from '@/api/@types/models';

interface GetPostsProps {
  page?: number;
  size?: number
}

export async function getPosts({ page = 0, size = 20 }: GetPostsProps) {
  const response = await socialApi.get<PostDetail[]>(`/feed-social-post/`, {
    params: {
      skip: page,
      limit: size
    }
  });

  return response.data;
}