import { api } from '../utils/api';
import type { Announcement } from '../types';

export const announcementService = {
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await api.get('/rest/v1/announcements?select=*&order=created_at.desc');
    return response.data;
  },

  async createAnnouncement(data: { title: string; message: string }): Promise<Announcement> {
    const response = await api.post('/rest/v1/announcements', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },
};
