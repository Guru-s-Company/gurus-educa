import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { subjectController } from "../controllers/subject.controller";
import {
  createSubjectSchema,
  listSubjectsQuerySchema,
  addSubjectToClassSchema,
  classSubjectParamsSchema,
  subjectIdParamSchema,
} from "../lib/validators/subject";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /subjects
 * Criar matéria no catálogo - ADMIN
 * Body: CreateSubjectInput { code, name, description? }
 * Response: 201 SubjectResponse
 */
router.post(
  "/",
  requireRole("ADMIN"),
  validateBody(createSubjectSchema),
  subjectController.createSubject
);

/**
 * GET /subjects
 * Listar catálogo de matérias - qualquer usuário autenticado
 * Query: ListSubjectsQuery (page, limit, sortBy, sortOrder, search)
 * Response: 200 { data: SubjectResponse[], pagination }
 */
router.get(
  "/",
  validateQuery(listSubjectsQuerySchema),
  subjectController.listSubjects
);

/**
 * POST /classes/:classId/subjects
 * Adicionar matéria à turma - professor da turma ou ADMIN
 * Body: AddSubjectToClassInput { subjectId }
 * Response: 201 ClassSubjectResponse
 */
router.post(
  "/classes/:classId/subjects",
  validateParams(subjectIdParamSchema), // valida classId
  validateBody(addSubjectToClassSchema),
  subjectController.addSubjectToClass
);

/**
 * DELETE /classes/:classId/subjects/:subjectId
 * Remover matéria da turma - professor da turma ou ADMIN
 * Response: 204
 */
router.delete(
  "/classes/:classId/subjects/:subjectId",
  validateParams(classSubjectParamsSchema),
  subjectController.removeSubjectFromClass
);

/**
 * GET /classes/:classId/subjects
 * Listar matérias da turma - professor/ADMIN ou alunos matriculados
 * Response: 200 { data: ClassSubjectResponse[] }
 */
router.get(
  "/classes/:classId/subjects",
  validateParams(subjectIdParamSchema), // valida classId
  subjectController.listClassSubjects
);

export default router;