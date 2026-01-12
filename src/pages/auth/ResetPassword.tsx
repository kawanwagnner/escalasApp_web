import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verificationCodeService } from "../../services/verificationCode.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { showToast } from "../../utils/toast";
import {
  AuthLayout,
  AuthHeader,
  AuthErrorAlert,
  AuthDivider,
  AuthLink,
} from "../../components/auth";
import {
  resetPasswordSchema,
  validateField,
  type ResetPasswordFormData,
} from "../../lib/validations";
import { handleAuthError } from "../../utils/errorHandler";
import { Mail, ArrowLeft, Info, Send, KeyRound } from "lucide-react";

export const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ResetPasswordFormData, boolean>>
  >({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Atualiza campo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ email: value });

    if (errors.email) {
      setErrors({});
    }
  };

  // Valida campo ao sair (blur)
  const handleBlur = useCallback(async () => {
    setTouched({ email: true });
    const error = await validateField(
      resetPasswordSchema,
      "email",
      formData.email
    );
    setErrors({ email: error });
  }, [formData.email]);

  // Verifica se campo está válido
  const isFieldValid = touched.email && !errors.email && formData.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validar o formulário
    try {
      await resetPasswordSchema.validate(formData, { abortEarly: false });
    } catch (err: any) {
      setTouched({ email: true });
      const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> =
        {};
      err.inner?.forEach((error: any) => {
        if (error.path) {
          fieldErrors[error.path as keyof ResetPasswordFormData] =
            error.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitError(
        "Por favor, informe um email válido para recuperar sua senha."
      );
      return;
    }

    setLoading(true);

    try {
      // Solicita código de verificação para o email
      await verificationCodeService.requestCode(formData.email);

      showToast.success("Código enviado! Verifique seu email.");

      // Redireciona para a tela de verificação de código
      navigate("/verify-code", {
        state: { email: formData.email },
      });
    } catch (err: any) {
      const { message } = handleAuthError(err);
      setSubmitError(message);
      showToast.error(message || "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout gradient="green">
      <AuthHeader
        title="Recuperar Senha"
        subtitle="Vamos te ajudar a recuperar o acesso à sua conta"
        iconColor="green"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthErrorAlert error={submitError} title="Não foi possível enviar" />

          {/* Instruções */}
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <KeyRound className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Como funciona?</p>
              <p>
                Digite o email da sua conta e enviaremos um código de 6 dígitos
                para você verificar sua identidade e criar uma nova senha.
              </p>
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
            <Input
              type="email"
              name="email"
              label="Email da sua conta"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ""}
              success={!!isFieldValid}
              hint="Digite o email usado no cadastro da sua conta"
              required
              className="pl-10"
              autoComplete="email"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-semibold"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? (
              "Enviando código..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar código de verificação
              </>
            )}
          </Button>

          <AuthDivider />

          <div className="space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>

            <AuthLink
              text="Não tem uma conta?"
              linkText="Cadastre-se gratuitamente"
              to="/register"
            />
          </div>
        </form>
      </Card>

      <p className="text-center text-xs text-gray-500 mt-4">
        O código é válido por 30 minutos. Verifique também a pasta de spam.
      </p>
    </AuthLayout>
  );
};
