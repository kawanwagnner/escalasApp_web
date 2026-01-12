import { api, publicApi } from '../utils/api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/v1/token?grant_type=password', {
      email,
      password,
    });
    
    const authData = response.data;
    
    // Busca o perfil completo do usuário
    const profileResponse = await api.get(`/rest/v1/profiles?id=eq.${authData.user.id}&select=*`, {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
      },
    });
    const profile = profileResponse.data[0];
    
    // Mescla os dados do auth com o perfil
    return {
      ...authData,
      user: {
        id: authData.user.id,
        email: profile?.email || authData.user.email,
        full_name: profile?.full_name || authData.user.user_metadata?.full_name || '',
        role: profile?.role || 'member',
        phone: profile?.phone,
        created_at: profile?.created_at || authData.user.created_at,
        updated_at: profile?.updated_at || authData.user.updated_at,
      },
    };
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

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/v1/token?grant_type=refresh_token', {
      refresh_token: refreshToken,
    });
    
    const authData = response.data;
    
    // Busca o perfil completo do usuário
    const profileResponse = await api.get(`/rest/v1/profiles?id=eq.${authData.user.id}&select=*`, {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
      },
    });
    const profile = profileResponse.data[0];
    
    // Mescla os dados do auth com o perfil
    return {
      ...authData,
      user: {
        id: authData.user.id,
        email: profile?.email || authData.user.email,
        full_name: profile?.full_name || authData.user.user_metadata?.full_name || '',
        role: profile?.role || 'member',
        phone: profile?.phone,
        created_at: profile?.created_at || authData.user.created_at,
        updated_at: profile?.updated_at || authData.user.updated_at,
      },
    };
  },

  async resetPassword(email: string): Promise<void> {
    // Determina a URL base do site (produção ou desenvolvimento)
    const siteUrl = window.location.origin;
    const redirectTo = `${siteUrl}/update-password`;
    
    await api.post('/auth/v1/recover', { 
      email,
      redirectTo: redirectTo,
    });
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

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Chama a Edge Function que tem acesso ao service role (bypass RLS)
      const response = await publicApi.post('/functions/v1/check-email-exists', {
        email: email.toLowerCase().trim(),
      });
      console.log('Verificação de email:', email, 'Resultado:', response.data);
      return response.data?.exists === true;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  },
};
