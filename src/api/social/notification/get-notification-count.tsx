import { socialApi } from '@/lib/axios';

export interface NotificationsCountResponse {
  notification_count: number;
}

export async function getNotificationCount() {
  const response = await socialApi.get<NotificationsCountResponse>('/header/');
  return response.data;
}