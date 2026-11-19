import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar matéria no catálogo (ADMIN)
 */
export const createSubjectSchema = z.object({
  code: z
    .string("Código da matéria é obrigatório")
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(20, "Código deve ter no máximo 20 caracteres")
    .regex(/^[A-Z0-9-_]+$/, "Código deve conter apenas letras maiúsculas, números, hífen ou underscore"),
  name: z
    .string("Nome da matéria é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

/**
 * Schema para query de listagem de matérias
 */
export const listSubjectsQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
});

/**
 * Schema para adicionar matéria a uma turma (professor/ADMIN)
 */
export const addSubjectToClassSchema = z.object({
  subjectId: z.coerce.number().int().positive("ID da matéria é obrigatório"),
});

/**
 * Parâmetros de rota: subjectId
 */
export const subjectIdParamSchema = idParamSchema;

/**
 * Parâmetros de rota compostos: classId + subjectId
 */
export const classSubjectParamsSchema = z.object({
  classId: z.string().regex(/^\d+$/, "ID da turma deve ser numérico").transform(Number),
  subjectId: z.string().regex(/^\d+$/, "ID da matéria deve ser numérico").transform(Number),
});

/**
 * Tipos inferidos
 */
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type ListSubjectsQuery = z.infer<typeof listSubjectsQuerySchema>;
export type AddSubjectToClassInput = z.infer<typeof addSubjectToClassSchema>;
export type SubjectIdParam = z.infer<typeof subjectIdParamSchema>;
export type ClassSubjectParams = z.infer<typeof classSubjectParamsSchema>;

/**
 * Response types
 */
export interface SubjectResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    classSubjects: number;
  };
}

export interface ClassSubjectResponse {
  id: number;
  classGroupId: number;
  subjectId: number;
  subject: SubjectResponse;
  createdAt: Date;
}