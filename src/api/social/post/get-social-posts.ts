import { socialApi } from '@/lib/axios';
import { PostDetail } from '@/api/@types/models';

interface GetSocialPostsProps {
  skip?: number;
  limit?: number;
}

export async function getSocialPosts({ skip = 0, limit = 20 }: GetSocialPostsProps) {
  const response = await socialApi.get<PostDetail[]>(`/feed-social-post/`, {
    params: { 
      skip, 
      limit 
    }
  });

  return response.data;
}