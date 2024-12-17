import { socialApi } from "@/lib/axios";

interface UpdateGrowPostBody {
  post_id: number
  description?: string;
  day: number;
  strain_id: number;
  phase_id: number
}

interface UpdateGrowPostResponse {
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

export default async function updateGrowPost({ post_id, description, day, strain_id, phase_id }: UpdateGrowPostBody) {
  const response = await socialApi.put<UpdateGrowPostResponse>(`/grow-post/${post_id}`, { 
    day, 
    phase_id,
    strain_id, 
    description,
  });

  return response.data;
}
