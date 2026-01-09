import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorAlertProps {
  error: string;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Ops! Algo deu errado</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );
};
