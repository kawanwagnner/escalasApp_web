import { api } from '../utils/api';
import type { Assignment } from '../types';

export const assignmentService = {
  async getMyAssignments(userId: string): Promise<Assignment[]> {
    // Buscar assignments com join em slot e schedule (usando sintaxe correta do Supabase)
    const response = await api.get(
      `/rest/v1/assignments?user_id=eq.${userId}&select=*,slot:slots!slot_id(id,title,date,start_time,end_time,schedule_id,schedule:schedules!schedule_id(id,title,date))&order=created_at.desc`
    );
    return response.data;
  },

  async assignToSlot(data: {
    slot_id: string;
    user_id: string;
    assigned_by: string;
  }): Promise<Assignment> {
    const response = await api.post('/rest/v1/assignments', data);
    return response.data;
  },

  async unassignFromSlot(id: string): Promise<void> {
    await api.delete(`/rest/v1/assignments?id=eq.${id}`);
  },
};
