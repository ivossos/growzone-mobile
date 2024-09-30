import { authApi } from '@/lib/axios';
export interface LegalDocumentResponse {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export async function getLegalDocument() {
  const response = await authApi.get<LegalDocumentResponse[]>('/legal-document/');
  return response.data;
}