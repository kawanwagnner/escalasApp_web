import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  AuthLayout,
  AuthHeader,
  AuthErrorAlert,
  PasswordStrengthIndicator,
} from "../../components/auth";
import {
  updatePasswordSchema,
  validateField,
  checkPasswordCriteria,
  getPasswordStrength,
  isPasswordStrong,
  type UpdatePasswordFormData,
} from "../../lib/validations";
import { handleAuthError } from "../../utils/errorHandler";
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

// Extrai os parâmetros do hash da URL (formato Supabase)
function getHashParams(): Record<string, string> {
  const hash = window.location.hash.substring(1);
  const params: Record<string, string> = {};

  hash.split("&").forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return params;
}

export const UpdatePassword: React.FC = () => {
  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdatePasswordFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof UpdatePasswordFormData, boolean>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  const navigate = useNavigate();

  // Verifica se tem token válido na URL
  useEffect(() => {
    const checkToken = async () => {
      const hashParams = getHashParams();
      const accessToken = hashParams.access_token;
      const type = hashParams.type;

      // Verifica se é um link de recuperação
      if (accessToken && type === "recovery") {
        // Salva o token temporariamente para usar na atualização
        localStorage.setItem("access_token", accessToken);
        setIsValidToken(true);

        // Limpa o hash da URL para segurança
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        // Verifica se já tem um token salvo (pode ter sido setado antes)
        const existingToken = localStorage.getItem("access_token");
        if (existingToken) {
          // Tenta verificar se o token ainda é válido
          try {
            await authService.getCurrentUser();
            setIsValidToken(true);
          } catch {
            setIsValidToken(false);
          }
        } else {
          setIsValidToken(false);
        }
      }

      setCheckingToken(false);
    };

    checkToken();
  }, []);

  // Critérios de senha
  const passwordCriteria = useMemo(
    () => checkPasswordCriteria(formData.password),
    [formData.password]
  );
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordCriteria),
    [passwordCriteria]
  );

  // Atualiza campo
  const handleChange =
    (field: keyof UpdatePasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  // Valida campo ao sair (blur)
  const handleBlur = useCallback(
    async (field: keyof UpdatePasswordFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = await validateField(
        updatePasswordSchema,
        field,
        formData[field]
      );
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData]
  );

  // Verifica se campo está válido
  const isFieldValid = (field: keyof UpdatePasswordFormData): boolean => {
    if (field === "confirmPassword") {
      return !!(
        touched[field] &&
        !errors[field] &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword
      );
    }
    return !!(touched[field] && !errors[field] && formData[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validar o formulário
    try {
      await updatePasswordSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      setTouched({ password: true, confirmPassword: true });
      const fieldErrors: Partial<Record<keyof UpdatePasswordFormData, string>> =
        {};
      err.inner?.forEach((error: any) => {
        if (error.path) {
          fieldErrors[error.path as keyof UpdatePasswordFormData] =
            error.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // Verifica força da senha
    if (!isPasswordStrong(passwordCriteria)) {
      setSubmitError(
        "Sua nova senha não atende aos requisitos mínimos de segurança."
      );
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(formData.password);
      setSuccess(true);

      // Limpa o token após sucesso (usuário precisará fazer login novamente)
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } catch (err) {
      const { message } = handleAuthError(err);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  // Loading enquanto verifica token
  if (checkingToken) {
    return (
      <AuthLayout gradient="green">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-600">Verificando link de recuperação...</p>
        </div>
      </AuthLayout>
    );
  }

  // Token inválido ou ausente
  if (isValidToken === false) {
    return (
      <AuthLayout gradient="green">
        <Card>
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-amber-100 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-amber-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Link inválido ou expirado
              </h2>
              <p className="text-gray-600 text-sm max-w-sm mx-auto">
                Este link de recuperação de senha não é válido ou já foi
                utilizado. Os links expiram após 1 hora por segurança.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full py-3 text-base font-semibold"
                onClick={() => navigate("/reset-password")}
              >
                Solicitar novo link
              </Button>

              <Button
                variant="secondary"
                className="w-full py-2.5"
                onClick={() => navigate("/login")}
              >
                Voltar para o login
              </Button>
            </div>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  // Sucesso
  if (success) {
    return (
      <AuthLayout gradient="green">
        <Card>
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Senha atualizada com sucesso!
              </h2>
              <p className="text-gray-600 text-sm">
                Sua nova senha foi definida. Agora você pode fazer login com
                ela.
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full py-3 text-base font-semibold"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </Button>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  // Formulário de nova senha
  return (
    <AuthLayout gradient="green">
      <AuthHeader
        title="Criar nova senha"
        subtitle="Digite sua nova senha abaixo"
        iconColor="green"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthErrorAlert error={submitError} />

          <div className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
                <Input
                  type="password"
                  name="password"
                  label="Nova Senha"
                  placeholder="Digite sua nova senha"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onBlur={() => handleBlur("password")}
                  error={touched.password ? errors.password : ""}
                  showPasswordToggle
                  required
                  className="pl-10"
                  autoComplete="new-password"
                  autoFocus
                />
              </div>

              {/* Indicador de força da senha */}
              <PasswordStrengthIndicator
                password={formData.password}
                criteria={passwordCriteria}
                strength={passwordStrength}
              />
            </div>

            {/* Confirmar Nova Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="password"
                name="confirmPassword"
                label="Confirmar Nova Senha"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                error={touched.confirmPassword ? errors.confirmPassword : ""}
                success={isFieldValid("confirmPassword")}
                hint="Repita a nova senha para confirmar"
                showPasswordToggle
                required
                className="pl-10"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-semibold"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar minha senha"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};
