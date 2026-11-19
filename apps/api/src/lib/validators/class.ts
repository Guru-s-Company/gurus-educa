import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar uma turma
 * Apenas TEACHER/ADMIN podem criar
 */
export const createClassSchema = z.object({
  name: z
    .string("Nome da turma é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  code: z
    .string("Código da turma é obrigatório")
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(20, "Código deve ter no máximo 20 caracteres")
    .regex(/^[A-Z0-9-_]+$/, "Código deve conter apenas letras maiúsculas, números, hífen ou underscore"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
  teacherId: z.coerce.number().int().positive().optional(), // ADMIN pode definir; TEACHER assume próprio ID
});

/**
 * Schema para atualizar uma turma
 * Campos opcionais; professor dono ou ADMIN
 */
export const updateClassSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
  teacherId: z.coerce.number().int().positive().optional(), // Apenas ADMIN pode alterar
}).strict();

/**
 * Schema para matricular aluno em turma
 * TEACHER/ADMIN da turma
 */
export const enrollStudentSchema = z.object({
  userId: z.coerce.number().int().positive("ID do aluno é obrigatório"),
});

/**
 * Schema para query de listagem de turmas
 * Filtros: professor, aluno (matriculado), busca por nome/código
 */
export const listClassesQuerySchema = paginationSchema.extend({
  teacherId: z.coerce.number().int().positive().optional(),
  studentId: z.coerce.number().int().positive().optional(),
  search: z.string().max(100).optional(),
  status: z.enum(["active", "inactive"]).optional(), // futuro: adicionar status na turma
});

/**
 * Schema para parâmetros de rota com classId
 */
export const classIdParamSchema = idParamSchema;

/**
 * Schema para parâmetros de rota compostos (classId + enrollmentId)
 */
export const classEnrollmentParamsSchema = z.object({
  classId: z.string().regex(/^\d+$/, "ID da turma deve ser numérico").transform(Number),
  enrollmentId: z.string().regex(/^\d+$/, "ID da matrícula deve ser numérico").transform(Number),
});

/**
 * Tipos inferidos
 */
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
export type ListClassesQuery = z.infer<typeof listClassesQuerySchema>;
export type ClassIdParam = z.infer<typeof classIdParamSchema>;
export type ClassEnrollmentParams = z.infer<typeof classEnrollmentParamsSchema>;

/**
 * Response types
 */
export interface ClassResponse {
  id: number;
  name: string;
  code: string;
  description: string | null;
  capacity: number | null;
  teacherId: number | null;
  teacherName: string | null;
  createdAt: Date;
  _count?: {
    enrollments: number;
    subjects: number;
    contents: number;
    sessions: number;
  };
}

export interface ClassDetailResponse extends ClassResponse {
  teacher: {
    id: number;
    name: string;
    email: string;
  } | null;
  enrollments: EnrollmentSummary[];
  subjects: SubjectSummary[];
}

export interface EnrollmentSummary {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: Date;
}

export interface SubjectSummary {
  id: number;
  code: string;
  name: string;
  description: string | null;
}