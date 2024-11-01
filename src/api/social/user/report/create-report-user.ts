import { socialApi } from '@/lib/axios';

interface CreateReportResponse {
  id: number;
  reporter_id: number;
  reported_id: number;
  reason_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function createReportUser(reported_id: number, reasonId: number) {
  const response = await socialApi.post<CreateReportResponse>(`/report-user/`, {
    reported_id: reported_id,
    reason_id: reasonId
  });

  return response.data;
}