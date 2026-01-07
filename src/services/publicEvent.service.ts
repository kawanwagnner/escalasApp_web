import { api } from '../utils/api';
import type { PublicEvent } from '../types';

export const publicEventService = {
  async getAllPublicEvents(): Promise<PublicEvent[]> {
    const response = await api.get('/rest/v1/public_events?select=*&order=date.asc');
    return response.data;
  },

  async createPublicEvent(data: Omit<PublicEvent, 'id' | 'created_at' | 'updated_at'>): Promise<PublicEvent> {
    const response = await api.post('/rest/v1/public_events', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async updatePublicEvent(id: string, data: Partial<PublicEvent>): Promise<PublicEvent> {
    const response = await api.patch(`/rest/v1/public_events?id=eq.${id}`, data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async deletePublicEvent(id: string): Promise<void> {
    await api.delete(`/rest/v1/public_events?id=eq.${id}`);
  },
};
