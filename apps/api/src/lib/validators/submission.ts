import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar entrega (aluno)
 */
export const createSubmissionSchema = z.object({
  textAnswer: z.string().max(50000, "Resposta deve ter no máximo 50000 caracteres").optional(),
  memberEnrollmentIds: z.array(z.coerce.number().int().positive()).optional(), // Para trabalho em grupo
});

/**
 * Schema para avaliar entrega (professor)
 */
export const gradeSubmissionSchema = z.object({
  grade: z.coerce.number().min(0).max(1000, "Nota deve ser entre 0 e 1000"),
  feedback: z.string().max(5000, "Feedback deve ter no máximo 5000 caracteres").optional(),
});

/**
 * Schema para query de listagem de entregas
 */
export const listSubmissionsQuerySchema = paginationSchema.extend({
  status: z.enum(["all", "submitted", "graded", "pending"]).default("all"),
  enrollmentId: z.coerce.number().int().positive().optional(),
});

/**
 * Schema para upload de anexo na entrega
 */
export const uploadSubmissionAttachmentSchema = z.object({
  fileName: z.string("Nome do arquivo é obrigatório").min(1).max(255),
  mimeType: z.string("Tipo MIME é obrigatório").min(1).max(100),
  sizeBytes: z.coerce.number().int().positive("Tamanho deve ser positivo"),
});

/**
 * Parâmetros de rota: activityId
 */
export const activityIdParamSchema = idParamSchema;

/**
 * Parâmetros de rota: submissionId
 */
export const submissionIdParamSchema = idParamSchema;

/**
 * Tipos inferidos
 */
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type UploadSubmissionAttachmentInput = z.infer<typeof uploadSubmissionAttachmentSchema>;
export type ActivityIdParam = z.infer<typeof activityIdParamSchema>;
export type SubmissionIdParam = z.infer<typeof submissionIdParamSchema>;

/**
 * Response types
 */
export interface SubmissionResponse {
  id: number;
  activityId: number;
  activityTitle: string;
  submittedAt: Date;
  textAnswer: string | null;
  grade: number | null;
  feedback: string | null;
  isLate: boolean;
  submissionMode: string;
  members: SubmissionMemberResponse[];
  attachments: SubmissionAttachmentResponse[];
}

export interface SubmissionMemberResponse {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
}

export interface SubmissionAttachmentResponse {
  id: number;
  fileName: string;
  url: string;
  mimeType: string | null;
  uploadedAt: Date;
}

export interface SubmissionListItem {
  id: number;
  activityId: number;
  activityTitle: string;
  submittedAt: Date;
  grade: number | null;
  isLate: boolean;
  members: SubmissionMemberResponse[];
}