import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Componente que detecta tokens de recuperação de senha na URL
 * e redireciona automaticamente para /update-password
 *
 * Deve ser colocado dentro do BrowserRouter mas fora das Routes
 */
export const RecoveryRedirect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;

    // Se tem um token de recuperação e não está já na página de update-password
    if (
      hash &&
      hash.includes("type=recovery") &&
      location.pathname !== "/update-password"
    ) {
      // Redireciona para update-password mantendo o hash com o token
      navigate("/update-password" + hash, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};
