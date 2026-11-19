import { z } from "zod/v4";
import { paginationSchema, idParamSchema } from "./common";

/**
 * Schema para criar material educacional
 * Professor da turma
 */
export const createContentSchema = z.object({
  title: z
    .string("Título é obrigatório")
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  body: z.string().max(50000, "Conteúdo deve ter no máximo 50000 caracteres").optional(),
  classSubjectId: z.coerce.number().int().positive().optional(), // Opcional: material geral da turma
});

/**
 * Schema para atualizar material
 */
export const updateContentSchema = z.object({
  title: z
    .string()
    .min(2, "Título deve ter pelo menos 2 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres")
    .optional(),
  body: z.string().max(50000, "Conteúdo deve ter no máximo 50000 caracteres").optional(),
  classSubjectId: z.coerce.number().int().positive().nullish(), // null = remover associação, undefined = não alterar
}).strict();

/**
 * Schema para query de listagem de conteúdos
 */
export const listContentsQuerySchema = paginationSchema.extend({
  classSubjectId: z.coerce.number().int().positive().optional(),
  search: z.string().max(100).optional(),
});

/**
 * Schema para upload de anexo (presigned URL)
 */
export const uploadAttachmentSchema = z.object({
  fileName: z.string("Nome do arquivo é obrigatório").min(1).max(255),
  mimeType: z.string("Tipo MIME é obrigatório").min(1).max(100),
  sizeBytes: z.coerce.number().int().positive("Tamanho deve ser positivo"),
});

/**
 * Parâmetros de rota: contentId
 */
export const contentIdParamSchema = idParamSchema;

/**
 * Parâmetros de rota: classId
 */
export const classIdParamSchema = idParamSchema;

/**
 * Tipos inferidos
 */
export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ListContentsQuery = z.infer<typeof listContentsQuerySchema>;
export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
export type ContentIdParam = z.infer<typeof contentIdParamSchema>;
export type ClassIdParam = z.infer<typeof classIdParamSchema>;

/**
 * Response types
 */
export interface ContentResponse {
  id: number;
  title: string;
  body: string | null;
  classGroupId: number;
  classSubjectId: number | null;
  classSubjectName: string | null;
  createdById: number | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: ContentAttachmentResponse[];
}

export interface ContentAttachmentResponse {
  id: number;
  fileName: string;
  url: string;
  mimeType: string | null;
  createdAt: Date;
}