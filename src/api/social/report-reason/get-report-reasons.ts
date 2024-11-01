import { socialApi } from '@/lib/axios';
import { ReportReason } from '@/api/@types/models';

interface GetReportReasonsProps {
  skip?: number;
  limit?: number;
}

export async function getReportReasons({ skip = 0, limit = 20 }: GetReportReasonsProps) {
  const response = await socialApi.get<ReportReason[]>('/report-reason/', {
    params: { 
      skip, 
      limit 
    }
  });
  return response.data;
}