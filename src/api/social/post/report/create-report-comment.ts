import { socialApi } from '@/lib/axios';

interface CreateReportResponse {
  id: number;
  user_id: number;
  comment_id: number;
  reason_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function createReportComment(commentId: number, reasonId: number) {
  const response = await socialApi.post<CreateReportResponse>(`/report-comment/`, {
    comment_id: commentId,
    reason_id: reasonId
  });

  return response.data;
}