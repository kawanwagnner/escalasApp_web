import { api } from '../utils/api';
import type { SlotInvite } from '../types';
import { assignmentService } from './assignment.service';

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
    // Primeiro, deletar convites anteriores do mesmo email/slot para permitir re-convite
    await api.delete(
      `/rest/v1/slot_invites?slot_id=eq.${data.slot_id}&email=eq.${encodeURIComponent(data.email)}`
    );
    
    // Criar novo convite
    const response = await api.post('/rest/v1/slot_invites', {
      ...data,
      status: 'pending',
    }, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async acceptInvite(id: string, userId: string): Promise<SlotInvite> {
    // Primeiro, buscar os dados do convite para obter o slot_id
    const inviteResponse = await api.get(
      `/rest/v1/slot_invites?id=eq.${id}&select=*`
    );
    const invite = inviteResponse.data[0];
    
    if (!invite) {
      throw new Error('Convite não encontrado');
    }

    // Atualizar o status do convite
    const response = await api.patch(`/rest/v1/slot_invites?id=eq.${id}`, {
      status: 'accepted',
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
    }, {
      headers: { Prefer: 'return=representation' },
    });

    // Criar o assignment para confirmar o membro na escala
    try {
      await assignmentService.assignToSlot({
        slot_id: invite.slot_id,
        user_id: userId,
        assigned_by: userId,
      });
    } catch (assignError) {
      console.warn('Erro ao criar assignment (pode já existir):', assignError);
      // Não lança erro - o convite já foi aceito
    }

    return response.data[0];
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
