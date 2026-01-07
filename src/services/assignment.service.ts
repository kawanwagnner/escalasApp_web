import { api } from '../utils/api';
import type { Assignment } from '../types';

export const assignmentService = {
  async getMyAssignments(userId: string): Promise<Assignment[]> {
    const response = await api.get(`/rest/v1/assignments?user_id=eq.${userId}&select=*`);
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
