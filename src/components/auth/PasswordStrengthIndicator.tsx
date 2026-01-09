import React from "react";
import { CheckCircle2, Shield } from "lucide-react";
import type { PasswordCriteria } from "../../lib/validations";

interface PasswordStrengthIndicatorProps {
  password: string;
  criteria: PasswordCriteria;
  strength: {
    level: number;
    label: string;
    color: string;
  };
}

const CriteriaItem: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <div
    className={`flex items-center gap-2 text-xs ${
      met ? "text-green-600" : "text-gray-500"
    }`}
  >
    {met ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : (
      <div className="h-3.5 w-3.5 border border-gray-300 rounded-full" />
    )}
    <span>{text}</span>
  </div>
);

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, criteria, strength }) => {
  if (!password) return null;

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            Força da senha:
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            strength.level <= 2
              ? "text-red-600"
              : strength.level === 3
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              level <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Critérios da senha */}
      <div className="grid grid-cols-2 gap-1 mt-2">
        <CriteriaItem met={criteria.minLength} text="6+ caracteres" />
        <CriteriaItem met={criteria.hasUppercase} text="Letra maiúscula" />
        <CriteriaItem met={criteria.hasLowercase} text="Letra minúscula" />
        <CriteriaItem met={criteria.hasNumber} text="Número" />
        <CriteriaItem met={criteria.hasSpecial} text="Caractere especial" />
      </div>
    </div>
  );
};
