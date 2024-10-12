import { socialApi } from '@/lib/axios';
import { PostDetail } from '@/api/@types/models';

interface GetPostsProps {
  skip?: number;
  limit?: number;
}

export async function getPosts({ skip = 0, limit = 20 }: GetPostsProps) {
  const response = await socialApi.get<PostDetail[]>(`/feed-social-post/`, {
    params: { 
      skip, 
      limit 
    }
  });

  return response.data;
}