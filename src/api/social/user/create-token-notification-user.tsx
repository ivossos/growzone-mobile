import { socialApi } from "@/lib/axios";

export async function createTokenNotification(token: string) {
  const response = await socialApi.post(`/expo-push-token/`, {
    token,
  });
  
  return response.data;
}
