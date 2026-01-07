import { api } from '../utils/api';
import type { Notification } from '../types';

export const notificationService = {
  async getMyNotifications(userId: string): Promise<Notification[]> {
    const response = await api.get(
      `/rest/v1/notifications?user_id=eq.${userId}&select=*&order=created_at.desc&limit=50`
    );
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(
      `/rest/v1/notifications?id=eq.${id}`,
      { read: true },
      { headers: { Prefer: 'return=representation' } }
    );
    return response.data[0];
  },

  async createNotification(data: {
    user_id: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const response = await api.post('/rest/v1/notifications', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },
};
