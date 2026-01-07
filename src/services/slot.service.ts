import { api } from '../utils/api';
import type { Slot } from '../types';

export const slotService = {
  async getSlotsBySchedule(scheduleId: string): Promise<Slot[]> {
    const response = await api.get(`/rest/v1/slots?schedule_id=eq.${scheduleId}&select=*`);
    return response.data;
  },

  async createSlot(data: Omit<Slot, 'id' | 'created_at' | 'updated_at'>): Promise<Slot> {
    const response = await api.post('/rest/v1/slots', data);
    return response.data;
  },

  async updateSlot(id: string, data: Partial<Slot>): Promise<Slot> {
    const response = await api.patch(`/rest/v1/slots?id=eq.${id}`, data);
    return response.data;
  },

  async deleteSlot(id: string): Promise<void> {
    await api.delete(`/rest/v1/slots?id=eq.${id}`);
  },
};
