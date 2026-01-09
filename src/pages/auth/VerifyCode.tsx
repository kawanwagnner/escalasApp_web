import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verificationCodeService } from "../../services/verificationCode.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { AuthLayout, AuthHeader, AuthErrorAlert } from "../../components/auth";
import { handleAuthError } from "../../utils/errorHandler";
import {
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Mail,
  Timer,
  AlertTriangle,
} from "lucide-react";

export const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeExpired, setCodeExpired] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Obtém o email do state da navegação
  const email = location.state?.email || "";

  // Redireciona se não tiver email
  useEffect(() => {
    if (!email) {
      navigate("/reset-password", { replace: true });
    }
  }, [email, navigate]);

  // Cooldown para reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Formata o código enquanto digita (apenas números)
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setCode(value);
      setError("");
      setCodeExpired(false);
    },
    []
  );

  // Valida o código
  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Digite o código completo de 6 dígitos");
      return;
    }

    setLoading(true);

    try {
      const result = await verificationCodeService.validateCode(email, code);

      if (result.is_valid) {
        setSuccess(true);
        // Aguarda animação e redireciona para atualização de senha
        setTimeout(() => {
          navigate("/update-password", {
            state: {
              email,
              verified: true,
              // Passa um token temporário para validar no UpdatePassword
              verificationToken: btoa(`${email}:${Date.now()}`),
            },
            replace: true,
          });
        }, 1500);
      } else {
        // Verifica se o código expirou
        if (result.message.toLowerCase().includes("expirado")) {
          setCodeExpired(true);
        }
        setError(result.message);
      }
    } catch (err) {
      const { message } = handleAuthError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reenvia o código
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResending(true);
    setError("");
    setCodeExpired(false);

    try {
      await verificationCodeService.requestCode(email);
      setCode("");
      setResendCooldown(60); // 60 segundos de cooldown
    } catch (err) {
      const { message } = handleAuthError(err);
      setError(message);
    } finally {
      setResending(false);
    }
  };

  // Renderiza indicadores de dígitos
  const renderCodeDigits = () => {
    const digits = code.split("");
    return (
      <div className="flex justify-center gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`
              w-10 h-12 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all
              ${
                digits[index]
                  ? "border-green-500 bg-green-50 text-green-700"
                  : index === digits.length
                  ? "border-green-400 bg-white animate-pulse"
                  : "border-gray-300 bg-gray-50 text-gray-400"
              }
            `}
          >
            {digits[index] || "•"}
          </div>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <AuthLayout gradient="green">
        <Card>
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Código verificado!
              </h2>
              <p className="text-gray-600">
                Redirecionando para a criação da nova senha...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout gradient="green">
      <AuthHeader
        title="Verificar Código"
        subtitle="Digite o código de 6 dígitos enviado para seu email"
        iconColor="green"
      />

      <Card>
        <form onSubmit={handleValidate} className="space-y-5">
          {/* Erro */}
          <AuthErrorAlert
            error={codeExpired ? `Código expirado: ${error}` : error}
          />

          {/* Info do email */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full shrink-0">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Código enviado para:</p>
                <p className="font-medium text-gray-900 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Aviso de expiração */}
          {codeExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">O código expirou!</p>
                <p>
                  Códigos são válidos por 30 minutos. Clique em "Reenviar
                  código" para receber um novo.
                </p>
              </div>
            </div>
          )}

          {/* Indicadores visuais dos dígitos */}
          {renderCodeDigits()}

          {/* Input do código */}
          <div className="relative">
            <KeyRound className="absolute left-3 top-9 h-5 w-5 text-gray-400 z-10" />
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="code"
              label="Código de verificação"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              maxLength={6}
              required
              className="pl-10 text-center text-xl tracking-widest font-mono"
              autoComplete="one-time-code"
              autoFocus
              error={error && !codeExpired ? " " : ""}
            />
          </div>

          {/* Timer de expiração */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Timer className="h-4 w-4" />
            <span>O código expira em 30 minutos</span>
          </div>

          {/* Botão de validar */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-semibold"
            isLoading={loading}
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              "Verificando..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Validar código
              </>
            )}
          </Button>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Não recebeu?</span>
            </div>
          </div>

          {/* Botão reenviar */}
          <Button
            type="button"
            variant="secondary"
            className="w-full py-2.5"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
          >
            {resending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reenviando...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Timer className="h-4 w-4 mr-2" />
                Reenviar em {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reenviar código
              </>
            )}
          </Button>

          {/* Link voltar */}
          <Link
            to="/reset-password"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Usar outro email
          </Link>
        </form>
      </Card>

      <p className="text-center text-xs text-gray-500 mt-4">
        Verifique também sua pasta de spam ou lixo eletrônico.
      </p>
    </AuthLayout>
  );
};
