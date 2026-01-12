import React, { useEffect } from "react";
import { AlertTriangle, X, Trash2, UserMinus } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  memberName?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Remoção",
  message = "Tem certeza que deseja continuar?",
  memberName,
  isLoading = false,
  variant = "danger",
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

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      border: "border-red-200",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      border: "border-amber-200",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      {/* Overlay escuro com blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Container do modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Conteúdo */}
          <div className="p-6 pt-8 text-center">
            {/* Ícone animado */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center animate-bounce-gentle`}
              >
                {memberName ? (
                  <UserMinus className={`h-8 w-8 ${styles.iconColor}`} />
                ) : (
                  <AlertTriangle className={`h-8 w-8 ${styles.iconColor}`} />
                )}
              </div>
            </div>

            {/* Título */}
            <h3
              id="confirm-delete-title"
              className="text-xl font-bold text-gray-900 mb-2"
            >
              {title}
            </h3>

            {/* Mensagem */}
            <p className="text-gray-600 mb-2">{message}</p>

            {/* Nome do membro se fornecido */}
            {memberName && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 ${styles.iconBg} ${styles.border} border rounded-full mt-2 mb-4`}
              >
                <div
                  className={`w-6 h-6 ${styles.iconBg} rounded-full flex items-center justify-center text-sm font-semibold ${styles.iconColor}`}
                >
                  {memberName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{memberName}</span>
              </div>
            )}

            {/* Aviso */}
            <p className="text-sm text-gray-500 mt-3">
              Esta ação não pode ser desfeita.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 p-6 pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 ${styles.button} text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sim, remover
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos de animação customizados */}
      <style>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ConfirmDeleteModal;
