/**
 * Tratamento centralizado de erros de API
 * Converte erros técnicos em mensagens amigáveis para o usuário
 */

export interface ApiErrorInfo {
  message: string;
  type: "auth" | "validation" | "network" | "server" | "unknown";
}

export function handleAuthError(error: any): ApiErrorInfo {
  console.error("Auth error:", error);

  const status = error.response?.status;
  const errorData = error.response?.data;
  const errorMessage =
    errorData?.error_description ||
    errorData?.message ||
    errorData?.msg ||
    error.message ||
    "";

  // Sem conexão com internet
  if (!navigator.onLine || errorMessage.toLowerCase().includes("network")) {
    return {
      message: "Sem conexão com a internet. Verifique sua rede e tente novamente.",
      type: "network",
    };
  }

  // Tratamento por código de status HTTP
  switch (status) {
    case 400:
      if (
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("registered") ||
        errorMessage.toLowerCase().includes("exists")
      ) {
        return {
          message: "Este email já está cadastrado. Tente fazer login ou recuperar sua senha.",
          type: "auth",
        };
      }
      return {
        message: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
        type: "auth",
      };

    case 401:
      return {
        message: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
        type: "auth",
      };

    case 404:
      return {
        message: "Não encontramos uma conta com este email. Verifique ou crie uma nova conta.",
        type: "auth",
      };

    case 409:
      return {
        message: "Este email já está cadastrado. Tente fazer login ou use outro email.",
        type: "auth",
      };

    case 422:
      if (errorMessage.toLowerCase().includes("email")) {
        return {
          message: "O formato do email é inválido. Verifique e tente novamente.",
          type: "validation",
        };
      }
      if (errorMessage.toLowerCase().includes("password")) {
        return {
          message: "A senha não atende aos requisitos. Use pelo menos 6 caracteres.",
          type: "validation",
        };
      }
      return {
        message: "Alguns dados estão incorretos. Verifique e tente novamente.",
        type: "validation",
      };

    case 429:
      return {
        message: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
        type: "auth",
      };

    default:
      if (status && status >= 500) {
        return {
          message: "Nosso servidor está com problemas. Tente novamente em alguns instantes.",
          type: "server",
        };
      }

      // Fallback baseado na mensagem
      if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("credentials")
      ) {
        return {
          message: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
          type: "auth",
        };
      }

      return {
        message: "Não foi possível completar a operação. Tente novamente.",
        type: "unknown",
      };
  }
}
