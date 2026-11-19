import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { contentController } from "../controllers/content.controller";
import {
  createContentSchema,
  updateContentSchema,
  listContentsQuerySchema,
  uploadAttachmentSchema,
  classIdParamSchema,
  contentIdParamSchema,
} from "../lib/validators/content";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /classes/:classId/contents
 * Criar material - professor da turma
 * Body: CreateContentInput { title, body?, classSubjectId? }
 * Response: 201 ContentResponse
 */
router.post(
  "/classes/:classId/contents",
  validateParams(classIdParamSchema),
  validateBody(createContentSchema),
  contentController.createContent
);

/**
 * GET /classes/:classId/contents
 * Listar materiais da turma - professor, alunos matriculados, ADMIN
 * Query: ListContentsQuery (page, limit, sortBy, sortOrder, classSubjectId, search)
 * Response: 200 { data: ContentResponse[], pagination }
 */
router.get(
  "/classes/:classId/contents",
  validateParams(classIdParamSchema),
  validateQuery(listContentsQuerySchema),
  contentController.listContents
);

/**
 * GET /contents/:id
 * Detalhes do material - professor, alunos matriculados, ADMIN
 * Response: 200 ContentResponse
 */
router.get(
  "/contents/:id",
  validateParams(contentIdParamSchema),
  contentController.getContent
);

/**
 * PATCH /contents/:id
 * Atualizar material - professor dono ou ADMIN
 * Body: UpdateContentInput { title?, body?, classSubjectId? }
 * Response: 200 ContentResponse
 */
router.patch(
  "/contents/:id",
  validateParams(contentIdParamSchema),
  validateBody(updateContentSchema),
  contentController.updateContent
);

/**
 * DELETE /contents/:id
 * Excluir material - professor dono ou ADMIN
 * Response: 204
 */
router.delete(
  "/contents/:id",
  validateParams(contentIdParamSchema),
  contentController.deleteContent
);

/**
 * POST /contents/:id/attachments
 * Gerar URL pré-assinada para upload de anexo
 * Body: UploadAttachmentInput { fileName, mimeType, sizeBytes }
 * Response: 201 { uploadUrl, key, attachmentId }
 */
router.post(
  "/contents/:id/attachments",
  validateParams(contentIdParamSchema),
  validateBody(uploadAttachmentSchema),
  contentController.generateAttachmentUploadUrl
);

/**
 * POST /attachments/:attachmentId/confirm
 * Confirmar upload de anexo (frontend chama após upload bem-sucedido)
 * Response: 200 ContentAttachmentResponse
 */
router.post(
  "/attachments/:attachmentId/confirm",
  validateParams(contentIdParamSchema), // reutiliza schema de ID numérico
  contentController.confirmAttachmentUpload
);

export default router;