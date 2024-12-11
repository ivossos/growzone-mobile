import { socialApi } from "@/lib/axios";

interface UpdateReelsPostBody {
  postId: number;
  description: string | null;
}

interface CreateReelsPostResponse {
  description: string;
  id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default async function updateReelsPost({ postId, description }: UpdateReelsPostBody) {
  const response = await socialApi.put<CreateReelsPostResponse>(`/reel-post/${postId}`, { description });

  return response.data;
}
