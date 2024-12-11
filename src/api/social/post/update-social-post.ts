import { socialApi } from "@/lib/axios";

interface UpdateSocialPostBody {
  postId: number;
  description: string | null;
}

interface CreateSocialPostResponse {
  description: string;
  id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default async function updateSocialPost({ postId, description }: UpdateSocialPostBody) {
  const response = await socialApi.put<CreateSocialPostResponse>(`/social-post/${postId}`, { description });

  return response.data;
}
