import { socialApi } from "@/lib/axios";

interface CreateGrowPostBody {
  images: { uri: string, fileName: string, type: string }[];
  video_count: number;
  description?: string;
  day: number;
  strain_id: number;
  phase_id: number
}

interface CreateGrowPostResponse {
  description: string;
  day: number;
  strain_id: number;
  phase_id: number;
  id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default async function createGrowPost({ images, video_count, description, day, phase_id, strain_id }: CreateGrowPostBody) {
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
  formData.append('day', day.toString());
  formData.append('phase_id', phase_id.toString());
  formData.append('strain_id', strain_id.toString());

  const response = await socialApi.post<CreateGrowPostResponse>(`/grow-post/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}