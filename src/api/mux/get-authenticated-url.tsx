import { socialApi } from '@/lib/axios';

type GetAuthenticatedResponse = {
  status: boolean;
  message: {
    url: string;
    id: string;
  };
}

export async function getAuthenticatedUrl() {
  const response = await socialApi.get<GetAuthenticatedResponse>('/mux/create-video-link');
  return response.data;
}