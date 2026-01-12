import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash-es";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  AuthLayout,
  AuthHeader,
  AuthErrorAlert,
  AuthDivider,
  AuthLink,
  PasswordStrengthIndicator,
} from "../../components/auth";
import {
  registerSchema,
  validateField,
  checkPasswordCriteria,
  getPasswordStrength,
  isPasswordStrong,
  type RegisterFormData,
} from "../../lib/validations";
import { handleAuthError } from "../../utils/errorHandler";
import { authService } from "../../services/auth.service";
import { Mail, Lock, User, Info, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterFormData, boolean>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Ref para o debounce (evita recriação a cada render)
  const checkEmailDebounced = useRef(
    debounce(async (email: string) => {
      // Valida formato do email antes de verificar no banco
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setEmailExists(false);
        setCheckingEmail(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const exists = await authService.checkEmailExists(email);
        setEmailExists(exists);
        if (exists) {
          setErrors((prev) => ({
            ...prev,
            email: "Este email já está cadastrado",
          }));
        }
      } catch (error) {
        console.error("Erro ao verificar email:", error);
      } finally {
        setCheckingEmail(false);
      }
    }, 500)
  ).current;

  // Cleanup do debounce ao desmontar
  useEffect(() => {
    return () => {
      checkEmailDebounced.cancel();
    };
  }, [checkEmailDebounced]);

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
    (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Limpa erro ao digitar
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      // Se for o campo email, verifica com debounce se já existe
      if (field === "email") {
        setEmailExists(false); // Reseta o estado
        checkEmailDebounced(value);
      }
    };

  // Valida campo ao sair (blur)
  const handleBlur = useCallback(
    async (field: keyof RegisterFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = await validateField(
        registerSchema,
        field,
        formData[field],
        formData
      );
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData]
  );

  // Verifica se campo está válido
  const isFieldValid = (field: keyof RegisterFormData): boolean => {
    if (field === "fullName") {
      return !!(
        touched[field] &&
        !errors[field] &&
        formData.fullName.trim().length >= 3 &&
        formData.fullName.includes(" ")
      );
    }
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

    // Validar todo o formulário
    try {
      await registerSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      // Marcar todos como tocados e mostrar erros
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
      });

      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      err.inner?.forEach((error: any) => {
        if (error.path) {
          fieldErrors[error.path as keyof RegisterFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // Verifica força da senha
    if (!isPasswordStrong(passwordCriteria)) {
      setSubmitError(
        "Sua senha não atende aos requisitos mínimos de segurança."
      );
      return;
    }

    // Se o email já existe, mostra o modal
    if (emailExists) {
      setShowEmailExistsModal(true);
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName.trim());
      navigate("/");
    } catch (err: any) {
      // Verifica se o erro é de email já existente
      const errorMessage =
        err.response?.data?.error_description ||
        err.response?.data?.message ||
        err.message ||
        "";
      if (
        errorMessage.toLowerCase().includes("already") ||
        errorMessage.toLowerCase().includes("registered") ||
        errorMessage.toLowerCase().includes("exists") ||
        err.response?.status === 409
      ) {
        setEmailExists(true);
        setShowEmailExistsModal(true);
      } else {
        const { message } = handleAuthError(err);
        setSubmitError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout gradient="purple">
      <AuthHeader
        title="Crie sua conta"
        subtitle="Comece a gerenciar suas escalas hoje"
        iconColor="purple"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthErrorAlert error={submitError} />

          {/* Dica informativa */}
          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Bem-vindo!</p>
              <p>
                Preencha os campos abaixo para criar sua conta. Campos com{" "}
                <span className="text-red-500">*</span> são obrigatórios.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nome Completo */}
            <div className="relative">
              <User className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                name="fullName"
                label="Nome Completo"
                placeholder="Ex: João da Silva"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                onBlur={() => handleBlur("fullName")}
                error={touched.fullName ? errors.fullName : ""}
                success={isFieldValid("fullName")}
                hint="Digite seu nome e sobrenome"
                required
                className="pl-10"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
              {/* Indicador de verificação de email */}
              {checkingEmail && (
                <div className="absolute right-3 top-9 z-10">
                  <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                </div>
              )}
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={() => handleBlur("email")}
                error={emailExists ? "Este email já está cadastrado" : touched.email ? errors.email : ""}
                success={isFieldValid("email") && !emailExists && !checkingEmail}
                hint={checkingEmail ? "Verificando email..." : "Você usará este email para fazer login"}
                required
                className="pl-10"
                autoComplete="email"
              />
              {/* Aviso de email existente */}
              {emailExists && !checkingEmail && (
                <div className="mt-2 flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    Este email já possui uma conta.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login", { state: { email: formData.email } })}
                      className="font-medium text-amber-700 hover:text-amber-800 underline"
                    >
                      Fazer login
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
                <Input
                  type="password"
                  name="password"
                  label="Senha"
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onBlur={() => handleBlur("password")}
                  error={touched.password ? errors.password : ""}
                  showPasswordToggle
                  required
                  className="pl-10"
                  autoComplete="new-password"
                />
              </div>

              {/* Indicador de força da senha */}
              <PasswordStrengthIndicator
                password={formData.password}
                criteria={passwordCriteria}
                strength={passwordStrength}
              />
            </div>

            {/* Confirmar Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="password"
                name="confirmPassword"
                label="Confirmar Senha"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                error={touched.confirmPassword ? errors.confirmPassword : ""}
                success={isFieldValid("confirmPassword")}
                hint="Repita a senha para confirmar"
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
            disabled={loading || emailExists || checkingEmail}
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
          </Button>

          {/* Aviso de termos */}
          <p className="text-xs text-gray-500 text-center">
            Ao criar sua conta, você concorda com nossos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>

          <AuthDivider />

          <AuthLink
            text="Já tem uma conta?"
            linkText="Faça login"
            to="/login"
          />
        </form>
      </Card>

      {/* Modal de Email já Cadastrado */}
      {showEmailExistsModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowEmailExistsModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
              {/* Header com ícone */}
              <div className="pt-8 pb-4 px-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Email já cadastrado!
                </h3>

                <p className="text-gray-600 mb-2">
                  O email{" "}
                  <span className="font-medium text-gray-900">
                    {formData.email}
                  </span>{" "}
                  já está registrado em nossa plataforma.
                </p>

                <p className="text-sm text-gray-500">
                  Você gostaria de fazer login ou usar outro email?
                </p>
              </div>

              {/* Botões */}
              <div className="p-6 pt-2 space-y-3">
                <button
                  onClick={() =>
                    navigate("/login", { state: { email: formData.email } })
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                >
                  <LogIn className="h-5 w-5" />
                  Fazer login
                </button>

                <button
                  onClick={() => {
                    setShowEmailExistsModal(false);
                    setFormData((prev) => ({ ...prev, email: "" }));
                    setTouched((prev) => ({ ...prev, email: false }));
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  <UserPlus className="h-5 w-5" />
                  Usar outro email
                </button>

                <button
                  onClick={() =>
                    navigate("/reset-password", {
                      state: { email: formData.email },
                    })
                  }
                  className="w-full text-sm text-gray-500 hover:text-indigo-600 transition-colors py-2"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
