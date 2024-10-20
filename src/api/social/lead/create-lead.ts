import { Lead } from '@/api/@types/models';
import { socialApi } from '@/lib/axios';

interface CreateLeadBody {
  store_name: string;
  department: string;
  product_quantity: number;
  average_revenue: number;
  erp_name: string;
}

export async function createLead({ store_name, department, product_quantity, average_revenue, erp_name }: CreateLeadBody) {
  const response = await socialApi.post<Lead>(`/lead/`, {
    store_name, department, product_quantity, average_revenue, erp_name 
  });

  return response.data;
}