import { socialApi } from '@/lib/axios';

interface CreateTicketResponse {
  id: number;
  user_id: number;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function createTicket(subject: string, content: string) {
  const response = await socialApi.post<CreateTicketResponse>(`/ticket/`, {
    subject,
    content
  });

  return response.data;
}