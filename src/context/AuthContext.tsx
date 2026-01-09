import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { authService } from "../services/auth.service";
import { queryClient } from "../lib/reactQuery";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (token) {
        try {
          // Tenta buscar o usuário atual com o token existente
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Se falhar e tiver refresh token, tenta renovar
          if (refreshToken) {
            try {
              const response = await authService.refreshSession(refreshToken);
              localStorage.setItem("access_token", response.access_token);
              localStorage.setItem("refresh_token", response.refresh_token);
              localStorage.setItem("user", JSON.stringify(response.user));
              setUser(response.user);
            } catch (refreshError) {
              // Refresh falhou, limpa tudo
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      } else if (refreshToken) {
        // Não tem access_token mas tem refresh_token, tenta renovar
        try {
          const response = await authService.refreshSession(refreshToken);
          localStorage.setItem("access_token", response.access_token);
          localStorage.setItem("refresh_token", response.refresh_token);
          localStorage.setItem("user", JSON.stringify(response.user));
          setUser(response.user);
        } catch (refreshError) {
          clearAuthData();
        }
      }
    } catch (error) {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (email: string, password: string) => {
    const response = await authService.signIn(email, password);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
    // Invalida todas as queries para forçar refetch com o novo usuário
    await queryClient.invalidateQueries();
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await authService.signUp(email, password, fullName);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
    // Invalida todas as queries para forçar refetch com o novo usuário
    await queryClient.invalidateQueries();
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      // Limpa todo o cache de queries
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
