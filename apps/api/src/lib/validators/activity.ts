import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar atividade
 * Professor da matéria na turma
 */
export const createActivitySchema = z.object({
  title: z
    .string("Título é obrigatório")
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().max(10000, "Descrição deve ter no máximo 10000 caracteres").optional(),
  dueAt: z.coerce.date().optional(),
  allowLateSubmissions: z.boolean().default(false),
  maxPoints: z.coerce.number().positive().max(1000).default(100),
  submissionMode: z.enum(["INDIVIDUAL", "GROUP"]).default("INDIVIDUAL"),
});

/**
 * Schema para atualizar atividade
 */
export const updateActivitySchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(10000).optional(),
  dueAt: z.coerce.date().nullable().optional(),
  allowLateSubmissions: z.boolean().optional(),
  maxPoints: z.coerce.number().positive().max(1000).optional(),
  submissionMode: z.enum(["INDIVIDUAL", "GROUP"]).optional(),
}).strict();

/**
 * Schema para query de listagem de atividades
 */
export const listActivitiesQuerySchema = paginationSchema.extend({
  status: z.enum(["published", "draft", "all"]).default("all"),
  search: z.string().max(100).optional(),
});

/**
 * Parâmetros de rota: classSubjectId
 */
export const classSubjectIdParamSchema = idParamSchema;

/**
 * Parâmetros de rota: activityId
 */
export const activityIdParamSchema = idParamSchema;

/**
 * Tipos inferidos
 */
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
export type ClassSubjectIdParam = z.infer<typeof classSubjectIdParamSchema>;
export type ActivityIdParam = z.infer<typeof activityIdParamSchema>;

/**
 * Response types
 */
export interface ActivityResponse {
  id: number;
  title: string;
  description: string | null;
  classSubjectId: number;
  classSubjectName: string;
  dueAt: Date | null;
  allowLateSubmissions: boolean;
  maxPoints: number;
  submissionMode: string;
  isPublished: boolean;
  createdAt: Date;
  _count?: {
    submissions: number;
  };
}

export interface ActivityDetailResponse extends ActivityResponse {
  submissions?: SubmissionSummary[];
}

export interface SubmissionSummary {
  id: number;
  enrollmentId: number;
  studentName: string;
  studentEmail: string;
  submittedAt: Date;
  grade: number | null;
  isLate: boolean;
}