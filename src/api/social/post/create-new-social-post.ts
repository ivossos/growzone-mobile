import { socialApi } from "@/lib/axios";

interface CreateSocialPostBody {
  images: { uri: string, fileName: string, type: string }[];
  videos: string[];
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

export default async function createNewSocialPost({ images, videos, description }: CreateSocialPostBody) {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("images", ({
      uri: image.uri,
      type: image.type,
      name: image.fileName || image.uri.split('/').pop()
    } as unknown as File));
  });

  videos.forEach((video) => {
    formData.append('videos', video);
  });
  
  formData.append('description', description ?? '');

  const response = await socialApi.post<CreateSocialPostResponse>(`/new-social-post/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
