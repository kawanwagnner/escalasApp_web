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
    // Primeiro busca o usuário autenticado
    const authResponse = await api.get('/auth/v1/user');
    const authUser = authResponse.data;
    
    // Depois busca o perfil completo na tabela profiles
    const profileResponse = await api.get(`/rest/v1/profiles?id=eq.${authUser.id}&select=*`);
    const profile = profileResponse.data[0];
    
    return {
      id: authUser.id,
      email: profile?.email || authUser.email,
      full_name: profile?.full_name || '',
      role: profile?.role,
      phone: profile?.phone,
      created_at: profile?.created_at || authUser.created_at,
      updated_at: profile?.updated_at || authUser.updated_at,
    };
  },

  async updatePassword(newPassword: string): Promise<void> {
    await api.put('/auth/v1/user', {
      password: newPassword,
    });
  },
};
