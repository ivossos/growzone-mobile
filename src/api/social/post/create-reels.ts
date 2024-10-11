import { socialApi } from "@/lib/axios";

interface CreateSocialPostBody {
  description?: string;
}

interface CreateSocialPostResponse {
  description: string;
  id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default async function createReels({ description }: CreateSocialPostBody) {
  const formData = new FormData();

  formData.append('description', description ?? '');

  const response = await socialApi.post<CreateSocialPostResponse>(`/reel-post/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
