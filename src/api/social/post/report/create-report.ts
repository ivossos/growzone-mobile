import { socialApi } from '@/lib/axios';

interface CreateReportResponse {
  id: number;
  user_id: number;
  post_id: number;
  reason_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function createReport(postId: number, reasonId: number) {
  const response = await socialApi.post<CreateReportResponse>(`/report-post/`, {
    post_id: postId,
    reason_id: reasonId
  });

  return response.data;
}