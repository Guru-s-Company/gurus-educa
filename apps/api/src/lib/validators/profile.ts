import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  fullName: z
    .string("Nome completo é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120, "Nome deve ter no máximo 120 caracteres")
    .regex(/^[\p{L}\s'-]+$/u, "Nome contém caracteres inválidos")
    .optional(),
  phone: z
    .string("Telefone é obrigatório")
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(11, "Telefone deve ter no máximo 11 dígitos")
    .regex(/^\d+$/, "Telefone deve conter apenas números")
    .optional(),
  education: z
    .enum(["ensino-fundamental", "ensino-medio", "graduacao", "pos-graduacao"], "Escolaridade inválida")
    .optional(),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string("Senha atual é obrigatória").min(1, "Senha atual é obrigatória"),
  newPassword: z
    .string("Nova senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmNewPassword: z.string("Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Senhas não coincidem",
  path: ["confirmNewPassword"],
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;