import { socialApi } from '@/lib/axios';

interface DeleteBlockResponse {
  id: number;
  blocker_id: number;
  blocked_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function deleteBlockUser(userId: number) {
  const response = await socialApi.delete<DeleteBlockResponse>(`/block/${userId}`);

  return response.data;
}