import toast from 'react-hot-toast';

// Configurações padrão para os toasts
const defaultOptions = {
  duration: 4000,
  position: 'top-right' as const,
};

// Estilos personalizados
const successStyle = {
  background: '#10B981',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
};

const errorStyle = {
  background: '#EF4444',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
};

const warningStyle = {
  background: '#F59E0B',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
};

const infoStyle = {
  background: '#3B82F6',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
};

// Funções de toast fáceis de usar
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      ...defaultOptions,
      style: successStyle,
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      ...defaultOptions,
      duration: 5000,
      style: errorStyle,
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  },

  warning: (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: '⚠️',
      style: warningStyle,
    });
  },

  info: (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: 'ℹ️',
      style: infoStyle,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      ...defaultOptions,
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  // Para operações assíncronas (promise)
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      ...defaultOptions,
      success: { style: successStyle },
      error: { style: errorStyle },
    });
  },
};

export default showToast;
