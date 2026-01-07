import { api } from '../utils/api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/v1/token?grant_type=password', {
      email,
      password,
    });
    return response.data;
  },

  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response = await api.post('/auth/v1/signup', {
      email,
      password,
      data: {
        full_name: fullName,
      },
    });
    return response.data;
  },

  async signOut(): Promise<void> {
    await api.post('/auth/v1/logout');
  },

  async resetPassword(email: string): Promise<void> {
    await api.post('/auth/v1/recover', { email });
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/v1/user');
    return response.data;
  },
};
