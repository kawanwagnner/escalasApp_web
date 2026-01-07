import { api } from '../utils/api';
import type { SlotInvite } from '../types';

export const inviteService = {
  async getMyInvites(email: string): Promise<SlotInvite[]> {
    const response = await api.get(`/rest/v1/slot_invites?email=eq.${email}&select=*`);
    return response.data;
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
};
