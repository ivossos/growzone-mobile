import { socialApi } from '@/lib/axios';

interface CreateBlockResponse {
  id: number;
  blocker_id: number;
  blocked_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function createBlockUser(reportedId: number) {
  const response = await socialApi.post<CreateBlockResponse>(`/block/${reportedId}`);

  return response.data;
}