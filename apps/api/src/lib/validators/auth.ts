import { z } from "zod/v4";

/**
 * Schema para registro de usuário
 * Valida: email único, senha forte, CPF formato, telefone, nome, escolaridade
 */
export const registerSchema = z.object({
  email: z.email("Email inválido"),
  password: z
    .string("Senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string("Confirmação de senha é obrigatória"),
  fullName: z
    .string("Nome completo é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120, "Nome deve ter no máximo 120 caracteres")
    .regex(/^[\p{L}\s'-]+$/u, "Nome contém caracteres inválidos"),
  cpf: z
    .string("CPF é obrigatório")
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  phone: z
    .string("Telefone é obrigatório")
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(11, "Telefone deve ter no máximo 11 dígitos")
    .regex(/^\d+$/, "Telefone deve conter apenas números"),
  education: z.enum([
    "ensino-fundamental",
    "ensino-medio",
    "graduacao",
    "pos-graduacao",
  ], "Escolaridade inválida"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string("Senha é obrigatória").min(1, "Senha é obrigatória"),
});

/**
 * Schema para refresh token
 */
export const refreshSchema = z.object({
  refreshToken: z.string("Refresh token é obrigatório").min(1, "Refresh token é obrigatório"),
});

/**
 * Schema para logout
 */
export const logoutSchema = z.object({
  refreshToken: z.string("Refresh token é obrigatório").min(1, "Refresh token é obrigatório"),
});

// Tipos inferidos dos schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;