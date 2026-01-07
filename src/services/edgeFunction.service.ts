import { api } from '../utils/api';

export const edgeFunctionService = {
  async sendAnnouncementEmails(announcementId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/functions/v1/send-announcement-emails-smtp', {
      announcementId,
    });
    return response.data;
  },

  async sendScheduledNotifications(): Promise<{ success: boolean; sent: number }> {
    const response = await api.post('/functions/v1/send-scheduled-notifications', {});
    return response.data;
  },
};
