import React, { useEffect } from "react";
import { AlertCircle, X, Trash2, AlertTriangle, Info } from "lucide-react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
  icon?: React.ReactNode;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  variant = "danger",
  icon,
}) => {
  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fecha o modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      iconShadow: "shadow-red-500/30",
      button:
        "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      buttonShadow: "shadow-red-500/25 hover:shadow-red-500/40",
      ring: "focus:ring-red-500",
      DefaultIcon: Trash2,
    },
    warning: {
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconShadow: "shadow-amber-500/30",
      button:
        "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
      buttonShadow: "shadow-amber-500/25 hover:shadow-amber-500/40",
      ring: "focus:ring-amber-500",
      DefaultIcon: AlertTriangle,
    },
    info: {
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconShadow: "shadow-blue-500/30",
      button:
        "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
      buttonShadow: "shadow-blue-500/25 hover:shadow-blue-500/40",
      ring: "focus:ring-blue-500",
      DefaultIcon: Info,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.DefaultIcon;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      {/* Overlay com gradiente */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-900/70 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Container do modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl transform transition-all animate-modal-pop overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
        >
          {/* Background decorativo */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-gray-50 to-gray-100" />

          {/* Círculos decorativos */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-200/30 rounded-full blur-2xl" />
          <div className="absolute -top-5 -left-5 w-24 h-24 bg-gray-200/20 rounded-full blur-xl" />

          {/* Botão de fechar */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-all disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Conteúdo */}
          <div className="relative pt-8 pb-6 px-6 text-center">
            {/* Ícone principal */}
            <div className="flex justify-center mb-5">
              <div
                className={`w-20 h-20 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-xl ${config.iconShadow} transform rotate-3 transition-transform hover:rotate-0`}
              >
                {icon || <IconComponent className="h-10 w-10 text-white" />}
              </div>
            </div>

            {/* Título */}
            <h3
              id="confirm-action-title"
              className="text-xl font-bold text-gray-900 mb-2"
            >
              {title}
            </h3>

            {/* Mensagem */}
            <p className="text-gray-600 mb-1">{message}</p>

            {/* Descrição adicional */}
            {description && (
              <p className="text-sm text-gray-400 mb-4">{description}</p>
            )}

            {/* Aviso */}
            <div className="flex items-center justify-center gap-2 mt-4 mb-6 px-4 py-2.5 bg-gray-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">
                Esta ação não pode ser desfeita
              </span>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3.5 ${config.button} text-white font-semibold rounded-xl transition-all shadow-lg ${config.buttonShadow} disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.ring} active:scale-[0.98] flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Aguarde...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de animação */}
      <style>{`
        @keyframes modal-pop {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-pop {
          animation: modal-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ConfirmActionModal;
