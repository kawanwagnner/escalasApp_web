import { publicApi } from '../utils/api';

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  code?: string; // Apenas retornado em ambiente de desenvolvimento
}

export interface ValidateCodeResponse {
  is_valid: boolean;
  message: string;
}

export const verificationCodeService = {
  /**
   * Solicita um novo código de verificação para o email informado.
   * O código anterior (se existir) será substituído automaticamente.
   * Usa publicApi para evitar redirecionamento em caso de erro 401.
   */
  async requestCode(email: string): Promise<VerificationCodeResponse> {
    try {
      // Primeiro, gera o código no banco de dados usando publicApi
      const codeResponse = await publicApi.post('/rest/v1/rpc/create_or_update_verification_code', {
        p_email: email.toLowerCase().trim(),
      });

      const code = codeResponse.data;

      // Depois, envia o email usando a Edge Function existente
      try {
        await publicApi.post('/functions/v1/send-announcement-emails-smtp', {
          type: 'verification_code',
          email: email.toLowerCase().trim(),
          code: code,
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Mesmo se o email falhar, o código foi gerado
        // Em dev, ainda podemos continuar
        if (!import.meta.env.DEV) {
          throw new Error('Erro ao enviar email. Tente novamente.');
        }
      }

      return {
        success: true,
        message: 'Código de verificação enviado com sucesso!',
        // Em desenvolvimento, retorna o código para testes
        code: import.meta.env.DEV ? code : undefined,
      };
    } catch (error: any) {
      console.error('Erro ao solicitar código de verificação:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message ||
        'Erro ao enviar código de verificação. Tente novamente.'
      );
    }
  },

  /**
   * Valida o código de verificação informado pelo usuário.
   * Se válido, o código é automaticamente removido da tabela.
   * Usa publicApi para evitar redirecionamento em caso de erro 401.
   */
  async validateCode(email: string, code: string): Promise<ValidateCodeResponse> {
    try {
      // Chama a função RPC do Supabase para validar código
      const response = await publicApi.post('/rest/v1/rpc/validate_verification_code', {
        p_email: email.toLowerCase().trim(),
        p_code: code.trim(),
      });

      // A função retorna um array com um objeto { is_valid, message }
      const result = Array.isArray(response.data) ? response.data[0] : response.data;

      return {
        is_valid: result?.is_valid ?? false,
        message: result?.message ?? 'Erro ao validar código',
      };
    } catch (error: any) {
      console.error('Erro ao validar código de verificação:', error);
      return {
        is_valid: false,
        message: error.response?.data?.message || 'Erro ao validar código. Tente novamente.',
      };
    }
  },

  /**
   * Limpa códigos expirados manualmente (geralmente feito automaticamente pelo cron)
   */
  async cleanupExpiredCodes(): Promise<number> {
    try {
      const response = await publicApi.post('/rest/v1/rpc/cleanup_expired_verification_codes');
      return response.data || 0;
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error);
      return 0;
    }
  },

  /**
   * Verifica se um código ainda é válido sem consumí-lo
   * Usa publicApi para evitar redirecionamento em caso de erro 401.
   */
  async checkCodeExists(email: string): Promise<boolean> {
    try {
      const response = await publicApi.get('/rest/v1/verification_codes', {
        params: {
          email: `eq.${email.toLowerCase().trim()}`,
          select: 'id,expires_at',
        },
      });

      const codes = response.data;
      if (!codes || codes.length === 0) return false;

      // Verifica se o código não expirou
      const expiresAt = new Date(codes[0].expires_at);
      return expiresAt > new Date();
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return false;
    }
  },

  /**
   * Atualiza a senha do usuário após verificação do código.
   * Usa a Edge Function para atualização segura.
   */
  async updatePassword(
    email: string, 
    newPassword: string, 
    verificationToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Usa Edge Function para atualizar a senha de forma segura
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      if (SUPABASE_URL) {
        const response = await publicApi.post('/functions/v1/update-password', { 
          email: email.toLowerCase().trim(),
          newPassword,
          verificationToken,
        });

        return {
          success: true,
          message: response.data?.message || 'Senha atualizada com sucesso!',
        };
      }

      // Fallback: tenta usar RPC diretamente (requer configuração no Supabase)
      await publicApi.post('/rest/v1/rpc/admin_update_user_password', {
        p_email: email.toLowerCase().trim(),
        p_new_password: newPassword,
      });

      return {
        success: true,
        message: 'Senha atualizada com sucesso!',
      };
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      throw new Error(
        error.message || 
        error.response?.data?.error || 
        'Erro ao atualizar senha. Tente novamente.'
      );
    }
  },
};
