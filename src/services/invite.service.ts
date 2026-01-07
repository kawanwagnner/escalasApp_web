import { api } from '../utils/api';
import type { SlotInvite } from '../types';

export const inviteService = {
  async getMyInvites(email: string): Promise<SlotInvite[]> {
    const response = await api.get(
      `/rest/v1/slot_invites?email=eq.${email}&select=*,slot:slots!slot_id(id,title,start_time,end_time,mode,capacity,schedule_id)&order=created_at.desc`
    );
    return response.data;
  },

  async getInvitesBySlot(slotId: string): Promise<SlotInvite[]> {
    const response = await api.get(
      `/rest/v1/slot_invites?slot_id=eq.${slotId}&select=*&order=created_at.desc`
    );
    return response.data;
  },

  async createInvite(data: { slot_id: string; email: string }): Promise<SlotInvite> {
    const response = await api.post('/rest/v1/slot_invites', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async acceptInvite(id: string, userId: string): Promise<SlotInvite> {
    const response = await api.patch(`/rest/v1/slot_invites?id=eq.${id}`, {
      status: 'accepted',
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
    });
    return response.data;
  },

  async declineInvite(id: string): Promise<SlotInvite> {
    const response = await api.patch(`/rest/v1/slot_invites?id=eq.${id}`, {
      status: 'declined',
    });
    return response.data;
  },

  async deleteInvite(id: string): Promise<void> {
    await api.delete(`/rest/v1/slot_invites?id=eq.${id}`);
  },
};
