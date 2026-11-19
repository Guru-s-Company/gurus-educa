import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { submissionController } from "../controllers/submission.controller";
import {
  createSubmissionSchema,
  gradeSubmissionSchema,
  listSubmissionsQuerySchema,
  uploadSubmissionAttachmentSchema,
  activityIdParamSchema,
  submissionIdParamSchema,
} from "../lib/validators/submission";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /activities/:id/submissions
 * Entregar atividade - aluno matriculado
 * Body: CreateSubmissionInput { textAnswer?, memberEnrollmentIds? }
 * Response: 201 SubmissionResponse
 */
router.post(
  "/activities/:id/submissions",
  validateParams(activityIdParamSchema),
  validateBody(createSubmissionSchema),
  submissionController.createSubmission
);

/**
 * GET /activities/:id/submissions
 * Listar entregas - professor vê todas, aluno vê própria
 * Query: ListSubmissionsQuery (page, limit, sortBy, sortOrder, status, enrollmentId)
 * Response: 200 { data: SubmissionListItem[], pagination }
 */
router.get(
  "/activities/:id/submissions",
  validateParams(activityIdParamSchema),
  validateQuery(listSubmissionsQuerySchema),
  submissionController.listSubmissions
);

/**
 * GET /submissions/:id
 * Detalhes da entrega - professor, aluno dono, ADMIN
 * Response: 200 SubmissionResponse
 */
router.get(
  "/submissions/:id",
  validateParams(submissionIdParamSchema),
  submissionController.getSubmission
);

/**
 * PATCH /submissions/:id/grade
 * Avaliar entrega - professor da turma ou ADMIN
 * Body: GradeSubmissionInput { grade, feedback? }
 * Response: 200 SubmissionResponse
 */
router.patch(
  "/submissions/:id/grade",
  validateParams(submissionIdParamSchema),
  validateBody(gradeSubmissionSchema),
  submissionController.gradeSubmission
);

/**
 * POST /submissions/:id/attachments
 * Gerar URL pré-assinada para anexo na entrega
 * Body: UploadSubmissionAttachmentInput { fileName, mimeType, sizeBytes }
 * Response: 201 { uploadUrl, key, attachmentId }
 */
router.post(
  "/submissions/:id/attachments",
  validateParams(submissionIdParamSchema),
  validateBody(uploadSubmissionAttachmentSchema),
  submissionController.generateAttachmentUploadUrl
);

export default router;