import { api } from '../utils/api';
import type { SlotInvite } from '../types';
import { scheduleConflictService } from './scheduleConflict.service';

export const inviteService = {
  async getMyInvites(email: string): Promise<SlotInvite[]> {
    const response = await api.get(
      `/rest/v1/slot_invites?email=eq.${email}&select=*,slot:slots!slot_id(id,title,start_time,end_time,date,mode,capacity,schedule_id)&order=created_at.desc`
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
    // Usar edge function para verificação e criação atômica
    const result = await scheduleConflictService.createInviteWithConflictCheck(
      data.slot_id,
      data.email
    );

    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar convite');
    }

    return result.data as SlotInvite;
  },

  async acceptInvite(id: string, userId: string): Promise<SlotInvite> {
    // Usar edge function para verificação e aceitação atômica
    const result = await scheduleConflictService.acceptInviteWithConflictCheck(
      id,
      userId
    );

    if (!result.success) {
      throw new Error(result.error || 'Você já está escalado em outra escala no mesmo dia.');
    }

    return result.data?.invite as SlotInvite;
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
