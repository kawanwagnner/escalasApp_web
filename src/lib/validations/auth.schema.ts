import * as yup from "yup";

// Mensagens de erro customizadas
const messages = {
  required: (field: string) => `${field} é obrigatório`,
  email: "Digite um email válido (ex: seu@email.com)",
  minLength: (field: string, min: number) =>
    `${field} deve ter pelo menos ${min} caracteres`,
  passwordMatch: "As senhas não coincidem",
  fullName: "Por favor, informe seu nome completo (nome e sobrenome)",
};

// Schema de Login
export const loginSchema = yup.object({
  email: yup
    .string()
    .required(messages.required("O email"))
    .email(messages.email),
  password: yup
    .string()
    .required(messages.required("A senha"))
    .min(6, messages.minLength("A senha", 6)),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

// Schema de Cadastro
export const registerSchema = yup.object({
  fullName: yup
    .string()
    .required(messages.required("O nome"))
    .min(3, messages.minLength("O nome", 3))
    .test("has-surname", messages.fullName, (value) =>
      value ? value.trim().includes(" ") : false
    ),
  email: yup
    .string()
    .required(messages.required("O email"))
    .email(messages.email),
  password: yup
    .string()
    .required(messages.required("A senha"))
    .min(6, messages.minLength("A senha", 6)),
  confirmPassword: yup
    .string()
    .required("Confirme sua senha")
    .oneOf([yup.ref("password")], messages.passwordMatch),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;

// Schema de Reset de Senha
export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .required(messages.required("O email"))
    .email(messages.email),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

// Schema de Atualização de Senha (após link de recuperação)
export const updatePasswordSchema = yup.object({
  password: yup
    .string()
    .required(messages.required("A nova senha"))
    .min(6, messages.minLength("A nova senha", 6)),
  confirmPassword: yup
    .string()
    .required("Confirme sua nova senha")
    .oneOf([yup.ref("password")], messages.passwordMatch),
});

export type UpdatePasswordFormData = yup.InferType<typeof updatePasswordSchema>;

// Função auxiliar para validar campo individual
export async function validateField<T extends yup.AnyObject>(
  schema: yup.ObjectSchema<T>,
  field: keyof T,
  value: any
): Promise<string> {
  try {
    await schema.validateAt(field as string, { [field]: value });
    return "";
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return err.message;
    }
    return "";
  }
}

// Critérios de senha para indicador visual
export interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function checkPasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export function getPasswordStrength(criteria: PasswordCriteria): {
  level: number;
  label: string;
  color: string;
} {
  const score = Object.values(criteria).filter(Boolean).length;
  if (score <= 1) return { level: 1, label: "Muito fraca", color: "bg-red-500" };
  if (score === 2) return { level: 2, label: "Fraca", color: "bg-orange-500" };
  if (score === 3) return { level: 3, label: "Média", color: "bg-yellow-500" };
  if (score === 4) return { level: 4, label: "Forte", color: "bg-lime-500" };
  return { level: 5, label: "Muito forte", color: "bg-green-500" };
}

// Verifica se a senha é forte o suficiente
export function isPasswordStrong(criteria: PasswordCriteria): boolean {
  return (
    criteria.minLength &&
    (criteria.hasUppercase || criteria.hasLowercase) &&
    criteria.hasNumber
  );
}
