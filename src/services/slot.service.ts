import { api } from '../utils/api';
import type { Slot } from '../types';

export const slotService = {
  async getSlotsBySchedule(scheduleId: string): Promise<Slot[]> {
    // Incluir assignments e convites com dados do usuário
    const response = await api.get(
      `/rest/v1/slots?schedule_id=eq.${scheduleId}&select=*,assignments:assignments(id,user_id,user:profiles!user_id(id,full_name,email)),invites:slot_invites(id,email,status,created_at)&order=date.asc,start_time.asc`
    );
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
