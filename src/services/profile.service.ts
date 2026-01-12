import { api } from '../utils/api';
import type { Profile } from '../types';

export const profileService = {
  async getAllProfiles(): Promise<Profile[]> {
    const response = await api.get('/rest/v1/profiles?select=*');
    return response.data;
  },

  async getProfileById(id: string): Promise<Profile> {
    const response = await api.get(`/rest/v1/profiles?id=eq.${id}&select=*`);
    return response.data[0];
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    const response = await api.patch(`/rest/v1/profiles?id=eq.${id}`, data, {
      headers: {
        'Prefer': 'return=representation'
      }
    });
    return response.data?.[0] || response.data;
  },
};
