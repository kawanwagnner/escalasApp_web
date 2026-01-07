import { api } from '../utils/api';
import type { Schedule } from '../types';

export const scheduleService = {
  async getAllSchedules(): Promise<Schedule[]> {
    const response = await api.get('/rest/v1/schedules?select=*&order=date.desc');
    return response.data;
  },

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await api.get(`/rest/v1/schedules?id=eq.${id}&select=*`);
    return response.data[0];
  },

  async createSchedule(data: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
    const response = await api.post('/rest/v1/schedules', data);
    return response.data;
  },

  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const response = await api.patch(`/rest/v1/schedules?id=eq.${id}`, data);
    return response.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`/rest/v1/schedules?id=eq.${id}`);
  },
};
