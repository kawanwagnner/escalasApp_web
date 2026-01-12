import { api } from '../utils/api';
import type { Slot, Assignment, SlotInvite } from '../types';

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingSlot?: {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    schedule_title?: string;
  };
  message?: string;
}

export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  conflict?: ConflictInfo;
}

/**
 * Serviço para operações de escala com verificação de conflitos via Edge Function
 * 
 * Regras:
 * - Se o usuário já tem uma escala CONFIRMADA (assignment) no mesmo dia, há conflito
 * - Se o usuário tem convites PENDENTES, não há conflito (prioridade é pra quem aceitar primeiro)
 * - Escalas livres seguem a mesma regra das manuais
 * - Todas as operações são atômicas (verificação + criação no mesmo request)
 */
export const scheduleConflictService = {
  /**
   * Cria um convite com verificação de conflito atômica
   * @param slotId - ID do slot
   * @param email - Email do usuário a ser convidado
   */
  async createInviteWithConflictCheck(
    slotId: string,
    email: string
  ): Promise<EdgeFunctionResponse<SlotInvite>> {
    try {
      const response = await api.post('/functions/v1/schedule-conflict-check', {
        action: 'create_invite',
        slot_id: slotId,
        email,
      });
      return response.data;
    } catch (error: any) {
      // Tratar erro de conflito (status 409)
      if (error.response?.status === 409) {
        return error.response.data;
      }
      console.error('Erro ao criar convite:', error);
      throw error;
    }
  },

  /**
   * Aceita um convite com verificação de conflito atômica
   * @param inviteId - ID do convite
   * @param userId - ID do usuário que está aceitando
   */
  async acceptInviteWithConflictCheck(
    inviteId: string,
    userId: string
  ): Promise<EdgeFunctionResponse<{ invite: SlotInvite; assignment: Assignment }>> {
    try {
      const response = await api.post('/functions/v1/schedule-conflict-check', {
        action: 'accept_invite',
        invite_id: inviteId,
        user_id: userId,
      });
      return response.data;
    } catch (error: any) {
      // Tratar erro de conflito (status 409)
      if (error.response?.status === 409) {
        return error.response.data;
      }
      console.error('Erro ao aceitar convite:', error);
      throw error;
    }
  },

  /**
   * Auto-inscrição em escala livre com verificação de conflito atômica
   * @param slotId - ID do slot
   * @param userId - ID do usuário
   * @param assignedBy - ID de quem está atribuindo (opcional, default é o próprio usuário)
   */
  async selfAssignWithConflictCheck(
    slotId: string,
    userId: string,
    assignedBy?: string
  ): Promise<EdgeFunctionResponse<Assignment>> {
    try {
      const response = await api.post('/functions/v1/schedule-conflict-check', {
        action: 'self_assign',
        slot_id: slotId,
        user_id: userId,
        assigned_by: assignedBy || userId,
      });
      return response.data;
    } catch (error: any) {
      // Tratar erro de conflito (status 409)
      if (error.response?.status === 409) {
        return error.response.data;
      }
      console.error('Erro ao realizar inscrição:', error);
      throw error;
    }
  },

  // ========== MÉTODOS LEGADOS (para compatibilidade, mas usam a lógica local) ==========

  /**
   * Verifica se há conflito de escala para um usuário em uma determinada data
   * @deprecated Use createInviteWithConflictCheck, acceptInviteWithConflictCheck ou selfAssignWithConflictCheck
   */
  async checkConflict(
    userId: string,
    targetDate: string,
    excludeSlotId?: string
  ): Promise<ConflictInfo> {
    try {
      // Buscar todos os assignments do usuário com dados do slot
      const response = await api.get(
        `/rest/v1/assignments?user_id=eq.${userId}&select=*,slot:slots!slot_id(id,title,date,start_time,end_time,schedule_id,schedule:schedules!schedule_id(id,title))`
      );

      const assignments: Assignment[] = response.data;

      // Filtrar assignments do mesmo dia
      const conflictingAssignment = assignments.find((assignment) => {
        const slot = assignment.slot;
        if (!slot) return false;
        
        // Excluir o slot alvo se especificado
        if (excludeSlotId && slot.id === excludeSlotId) return false;
        
        // Comparar datas (apenas o dia, ignorando horário)
        return slot.date === targetDate;
      });

      if (conflictingAssignment && conflictingAssignment.slot) {
        const slot = conflictingAssignment.slot;
        const scheduleName = slot.schedule?.title || 'Ministério';
        
        return {
          hasConflict: true,
          conflictingSlot: {
            id: slot.id,
            title: slot.title,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            schedule_title: scheduleName,
          },
          message: `Este membro já está escalado no dia ${formatDate(targetDate)} na escala "${slot.title}" do ministério "${scheduleName}" (${slot.start_time} - ${slot.end_time}).`,
        };
      }

      return { hasConflict: false };
    } catch (error) {
      console.error('Erro ao verificar conflito de escala:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use createInviteWithConflictCheck, acceptInviteWithConflictCheck ou selfAssignWithConflictCheck
   */
  async checkConflictBySlotId(
    userId: string,
    targetSlotId: string
  ): Promise<ConflictInfo> {
    try {
      const slotResponse = await api.get(
        `/rest/v1/slots?id=eq.${targetSlotId}&select=id,title,date,start_time,end_time`
      );

      const targetSlot = slotResponse.data[0];
      
      if (!targetSlot) {
        throw new Error('Slot não encontrado');
      }

      return this.checkConflict(userId, targetSlot.date, targetSlotId);
    } catch (error) {
      console.error('Erro ao verificar conflito por slot_id:', error);
      throw error;
    }
  },

  /**
   * @deprecated Use createInviteWithConflictCheck
   */
  async checkConflictByEmail(
    email: string,
    targetSlotId: string
  ): Promise<ConflictInfo> {
    try {
      const userResponse = await api.get(
        `/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id`
      );

      const user = userResponse.data[0];
      
      if (!user) {
        return { hasConflict: false };
      }

      return this.checkConflictBySlotId(user.id, targetSlotId);
    } catch (error) {
      console.error('Erro ao verificar conflito por email:', error);
      throw error;
    }
  },
};

/**
 * Formata uma data para exibição no formato brasileiro
 */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}
