import { socialApi } from '@/lib/axios';
import { Notification } from '@/api/@types/models';

interface GetNotificationsProps {
  skip?: number;
  limit?: number
}

export async function getNotifications({skip = 0, limit = 20}: GetNotificationsProps) {
  const response = await socialApi.get<Notification[]>('/listed-notification/', {
    params: {
      skip, limit
    }
  });
  return response.data;
}