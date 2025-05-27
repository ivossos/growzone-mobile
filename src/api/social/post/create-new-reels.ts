import { socialApi } from "@/lib/axios";

interface CreateReelsPostBody {
  video: string;
  description?: string;
}

interface CreateNewReelsResponse {
  description: string;
  id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default async function createNewReels({
  video,
  description,
}: CreateReelsPostBody) {
  const formData = new FormData();

  formData.append("video", video);
  formData.append("description", description ?? "");

  const response = await socialApi.post<CreateNewReelsResponse>(
    `/new-reel-post/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
