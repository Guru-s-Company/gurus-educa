import { z } from "zod/v4";

/**
 * Schema para parâmetros de paginação
 * Usado em listagens (classes, conteúdos, atividades, etc.)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema para ID numérico em parâmetros de rota
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID deve ser numérico").transform(Number),
});

/**
 * Schema para ID composto (ex: classId + subjectId)
 */
export const compositeIdParamSchema = z.object({
  classId: z.string().regex(/^\d+$/, "ID da turma deve ser numérico").transform(Number),
  subjectId: z.string().regex(/^\d+$/, "ID da matéria deve ser numérico").transform(Number),
});

/**
 * Schema para range de datas
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  { message: "startDate deve ser anterior ou igual a endDate", path: ["startDate"] }
);

/**
 * Schema para filtros de busca textual
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
});

/**
 * Schema para ordenação genérica
 */
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Combina paginação + busca + ordenação
 * Para usar em listagens completas
 */
export const listQuerySchema = paginationSchema.merge(searchSchema).merge(sortingSchema);

/**
 * Tipos inferidos
 */
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type CompositeIdParam = z.infer<typeof compositeIdParamSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;

/**
 * Helper para construir resposta paginada padronizada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}