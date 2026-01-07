import { api } from '../utils/api';
import type { ScheduledNotification } from '../types';

export const scheduledNotificationService = {
  async getAllScheduledNotifications(): Promise<ScheduledNotification[]> {
    const response = await api.get(
      '/rest/v1/scheduled_notifications?select=*&order=scheduled_for.asc'
    );
    return response.data;
  },

  async createScheduledNotification(data: {
    user_id: string;
    title: string;
    body: string;
    scheduled_for: string;
    data?: Record<string, unknown>;
  }): Promise<ScheduledNotification> {
    const response = await api.post('/rest/v1/scheduled_notifications', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async deleteScheduledNotification(id: string): Promise<void> {
    await api.delete(`/rest/v1/scheduled_notifications?id=eq.${id}`);
  },
};
