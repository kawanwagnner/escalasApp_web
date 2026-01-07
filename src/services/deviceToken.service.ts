import { api } from '../utils/api';
import type { DeviceToken } from '../types';

export const deviceTokenService = {
  async getMyDeviceTokens(userId: string): Promise<DeviceToken[]> {
    const response = await api.get(
      `/rest/v1/device_tokens?user_id=eq.${userId}&select=*&order=created_at.desc`
    );
    return response.data;
  },

  async upsertDeviceToken(data: {
    user_id: string;
    token: string;
    active: boolean;
  }): Promise<DeviceToken> {
    const response = await api.post('/rest/v1/device_tokens', data, {
      headers: { Prefer: 'return=representation' },
    });
    return response.data[0];
  },

  async deactivateDeviceToken(id: string): Promise<DeviceToken> {
    const response = await api.patch(
      `/rest/v1/device_tokens?id=eq.${id}`,
      { active: false },
      { headers: { Prefer: 'return=representation' } }
    );
    return response.data[0];
  },
};
