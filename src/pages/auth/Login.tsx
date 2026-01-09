import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "../../components/auth";
import {
  loginSchema,
  validateField,
  type LoginFormData,
} from "../../lib/validations";
import { handleAuthError } from "../../utils/errorHandler";
import { Mail, Lock } from "lucide-react";

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginFormData, boolean>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Detecta token de recuperação de senha na URL e redireciona
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Redireciona para update-password mantendo o hash com o token
      navigate("/update-password" + hash, { replace: true });
    }
  }, [navigate]);

  // Atualiza campo e valida
  const handleChange =
    (field: keyof LoginFormData) =>
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
    async (field: keyof LoginFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = await validateField(loginSchema, field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData]
  );

  // Verifica se campo está válido
  const isFieldValid = (field: keyof LoginFormData): boolean =>
    !!(touched[field] && !errors[field] && formData[field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validar todo o formulário
    try {
      await loginSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      // Marcar todos como tocados e mostrar erros
      setTouched({ email: true, password: true });

      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      err.inner?.forEach((error: any) => {
        if (error.path) {
          fieldErrors[error.path as keyof LoginFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      const { message } = handleAuthError(err);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout gradient="blue">
      <AuthHeader
        title="Bem-vindo de volta!"
        subtitle="Faça login para gerenciar suas escalas"
        iconColor="blue"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthErrorAlert error={submitError} />

          <div className="space-y-4">
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
                hint="Digite o email usado no cadastro"
                required
                className="pl-10"
                autoComplete="username"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="password"
                name="password"
                label="Senha"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange("password")}
                onBlur={() => handleBlur("password")}
                error={touched.password ? errors.password : ""}
                success={isFieldValid("password")}
                hint="Mínimo de 6 caracteres"
                showPasswordToggle
                required
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-semibold"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar na minha conta"}
          </Button>

          <AuthDivider />

          <AuthLink
            text="Não tem uma conta?"
            linkText="Cadastre-se gratuitamente"
            to="/register"
          />
        </form>
      </Card>

      <p className="text-center text-xs text-gray-500 mt-4">
        Ao fazer login, você concorda com nossos termos de uso e política de
        privacidade.
      </p>
    </AuthLayout>
  );
};
