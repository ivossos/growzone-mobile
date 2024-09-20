import { api } from '@/lib/axios';
import { User } from '../@types/models';

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
  const response = await api.get<LegalDocumentResponse[]>('/legal-document/');
  return response.data;
}