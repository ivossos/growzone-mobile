import { socialApi } from "@/lib/axios";

interface CreateSocialPostBody {
  images: { uri: string, fileName: string, type: string }[];
  video_count: number;
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

export default async function createSocialPost({ images, video_count, description }: CreateSocialPostBody) {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("images", ({
      uri: image.uri,
      type: image.type,
      name: image.fileName || image.uri.split('/').pop()
    } as unknown as File));
  });

  video_count > 0 && formData.append('video_count', video_count.toString());
  formData.append('description', description ?? '');

  const response = await socialApi.post<CreateSocialPostResponse>(`/social-post/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
