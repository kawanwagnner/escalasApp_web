import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Mail, Lock, User, Info } from "lucide-react";

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

  const { signUp } = useAuth();
  const navigate = useNavigate();

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
    };

  // Valida campo ao sair (blur)
  const handleBlur = useCallback(
    async (field: keyof RegisterFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = await validateField(registerSchema, field, formData[field]);
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

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName.trim());
      navigate("/");
    } catch (err) {
      const { message } = handleAuthError(err);
      setSubmitError(message);
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
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={() => handleBlur("email")}
                error={touched.email ? errors.email : ""}
                success={isFieldValid("email")}
                hint="Você usará este email para fazer login"
                required
                className="pl-10"
                autoComplete="email"
              />
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
            disabled={loading}
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
    </AuthLayout>
  );
};
