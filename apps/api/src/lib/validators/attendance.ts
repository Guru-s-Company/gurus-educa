import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar sessão/encontro (professor)
 */
export const createSessionSchema = z.object({
  title: z
    .string("Título é obrigatório")
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().max(2000, "Descrição deve ter no máximo 2000 caracteres").optional(),
  scheduledStart: z.coerce.date("Data/hora de início é obrigatória"),
  scheduledEnd: z.coerce.date("Data/hora de fim é obrigatória"),
  meetingUrl: z.string().url("URL de reunião inválida").optional().or(z.literal("")),
  classSubjectId: z.coerce.number().int().positive().optional(),
}).refine((data) => data.scheduledStart < data.scheduledEnd, {
  message: "Data de início deve ser anterior à data de fim",
  path: ["scheduledStart"],
});

/**
 * Schema para atualizar sessão
 */
export const updateSessionSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  scheduledStart: z.coerce.date().optional(),
  scheduledEnd: z.coerce.date().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"]).optional(),
  classSubjectId: z.coerce.number().int().positive().nullable().optional(),
}).strict().refine((data) => {
  if (data.scheduledStart && data.scheduledEnd) {
    return data.scheduledStart < data.scheduledEnd;
  }
  return true;
}, { message: "Data de início deve ser anterior à data de fim", path: ["scheduledStart"] });

/**
 * Schema para registrar presença (professor)
 */
export const recordAttendanceSchema = z.object({
  enrollmentId: z.coerce.number().int().positive("ID da matrícula é obrigatório"),
  status: z.enum(["PRESENT", "ABSENT", "JUSTIFIED_ABSENCE"]),
  note: z.string().max(500, "Observação deve ter no máximo 500 caracteres").optional(),
});

/**
 * Schema para registrar presença em lote (professor)
 */
export const recordBulkAttendanceSchema = z.object({
  records: z.array(recordAttendanceSchema).min(1, "Pelo menos um registro é obrigatório"),
});

/**
 * Schema para query de listagem de sessões
 */
export const listSessionsQuerySchema = paginationSchema.extend({
  status: z.enum(["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED", "all"]).default("all"),
  classSubjectId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/**
 * Parâmetros de rota: classId
 */
export const classIdParamSchema = idParamSchema;

/**
 * Parâmetros de rota: sessionId
 */
export const sessionIdParamSchema = idParamSchema;

/**
 * Tipos inferidos
 */
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type RecordBulkAttendanceInput = z.infer<typeof recordBulkAttendanceSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type ClassIdParam = z.infer<typeof classIdParamSchema>;
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;

/**
 * Response types
 */
export interface SessionResponse {
  id: number;
  classGroupId: number;
  classSubjectId: number | null;
  classSubjectName: string | null;
  title: string;
  description: string | null;
  scheduledStart: Date;
  scheduledEnd: Date;
  meetingUrl: string | null;
  status: string;
  createdAt: Date;
  _count?: {
    attendances: number;
  };
}

export interface SessionDetailResponse extends SessionResponse {
  attendances: AttendanceRecordResponse[];
}

export interface AttendanceRecordResponse {
  id: number;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: string;
  note: string | null;
  recordedAt: Date;
}

export interface MyAttendanceResponse {
  sessionId: number;
  sessionTitle: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: string;
  recordedAt: Date | null;
  note: string | null;
}