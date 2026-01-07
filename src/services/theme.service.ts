import { api } from '../utils/api';
import type { Theme } from '../types';

export const themeService = {
  async getAllThemes(): Promise<Theme[]> {
    const response = await api.get('/rest/v1/themes?select=*');
    return response.data;
  },

  async createTheme(data: Omit<Theme, 'id' | 'created_at'>): Promise<Theme> {
    const response = await api.post('/rest/v1/themes', data);
    return response.data;
  },
};
