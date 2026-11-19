import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { activityController } from "../controllers/activity.controller";
import {
  createActivitySchema,
  updateActivitySchema,
  listActivitiesQuerySchema,
  classSubjectIdParamSchema,
  activityIdParamSchema,
} from "../lib/validators/activity";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /class-subjects/:classSubjectId/activities
 * Criar atividade - professor da turma
 * Body: CreateActivityInput
 * Response: 201 ActivityResponse
 */
router.post(
  "/class-subjects/:classSubjectId/activities",
  validateParams(classSubjectIdParamSchema),
  validateBody(createActivitySchema),
  activityController.createActivity
);

/**
 * GET /class-subjects/:classSubjectId/activities
 * Listar atividades - professor vê todas, alunos veem apenas publicadas
 * Query: ListActivitiesQuery (page, limit, sortBy, sortOrder, status, search)
 * Response: 200 { data: ActivityResponse[], pagination }
 */
router.get(
  "/class-subjects/:classSubjectId/activities",
  validateParams(classSubjectIdParamSchema),
  validateQuery(listActivitiesQuerySchema),
  activityController.listActivities
);

/**
 * GET /activities/:id
 * Detalhes da atividade
 * Response: 200 ActivityResponse
 */
router.get(
  "/activities/:id",
  validateParams(activityIdParamSchema),
  activityController.getActivity
);

/**
 * PATCH /activities/:id
 * Atualizar atividade - professor dono ou ADMIN
 * Body: UpdateActivityInput
 * Response: 200 ActivityResponse
 */
router.patch(
  "/activities/:id",
  validateParams(activityIdParamSchema),
  validateBody(updateActivitySchema),
  activityController.updateActivity
);

/**
 * PATCH /activities/:id/publish
 * Publicar/Despublicar atividade - professor/ADMIN
 * Body: { publish: boolean }
 * Response: 200 ActivityResponse
 */
router.patch(
  "/activities/:id/publish",
  validateParams(activityIdParamSchema),
  validateBody(z.object({ publish: z.boolean() })),
  activityController.togglePublishActivity
);

/**
 * DELETE /activities/:id
 * Excluir atividade - professor dono ou ADMIN
 * Response: 204
 */
router.delete(
  "/activities/:id",
  validateParams(activityIdParamSchema),
  activityController.deleteActivity
);

// Need to import z for the inline schema
import { z } from "zod/v4";

export default router;