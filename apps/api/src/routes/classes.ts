import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { classController } from "../controllers/class.controller";
import {
  createClassSchema,
  updateClassSchema,
  enrollStudentSchema,
  listClassesQuerySchema,
  classIdParamSchema,
  classEnrollmentParamsSchema,
} from "../lib/validators/class";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /classes
 * Criar turma - TEACHER ou ADMIN
 * Body: CreateClassInput
 * Response: 201 ClassResponse
 */
router.post(
  "/",
  requireRole("TEACHER", "ADMIN"),
  validateBody(createClassSchema),
  classController.createClass
);

/**
 * GET /classes
 * Listar turmas - filtra por role do usuário
 * Query: ListClassesQuery (page, limit, sortBy, sortOrder, teacherId, studentId, search)
 * Response: 200 { data: ClassResponse[], pagination }
 */
router.get(
  "/",
  validateQuery(listClassesQuerySchema),
  classController.listClasses
);

/**
 * GET /classes/:id
 * Detalhes da turma - professor dono, alunos matriculados, ADMIN
 * Params: classId
 * Response: 200 ClassDetailResponse
 */
router.get(
  "/:id",
  validateParams(classIdParamSchema),
  classController.getClass
);

/**
 * PATCH /classes/:id
 * Atualizar turma - professor dono ou ADMIN
 * Body: UpdateClassInput
 * Response: 200 ClassResponse
 */
router.patch(
  "/:id",
  validateParams(classIdParamSchema),
  validateBody(updateClassSchema),
  classController.updateClass
);

/**
 * DELETE /classes/:id
 * Excluir turma - professor dono ou ADMIN
 * Response: 204
 */
router.delete(
  "/:id",
  validateParams(classIdParamSchema),
  classController.deleteClass
);

/**
 * POST /classes/:id/enroll
 * Matricular aluno - professor da turma ou ADMIN
 * Body: EnrollStudentInput { userId }
 * Response: 201 { enrollmentId, message }
 */
router.post(
  "/:id/enroll",
  validateParams(classIdParamSchema),
  validateBody(enrollStudentSchema),
  classController.enrollStudent
);

/**
 * DELETE /classes/:id/enroll/:enrollmentId
 * Remover/cancelar matrícula - professor/ADMIN ou aluno dono
 * Response: 204
 */
router.delete(
  "/:id/enroll/:enrollmentId",
  validateParams(classEnrollmentParamsSchema),
  classController.removeEnrollment
);

/**
 * GET /classes/:id/students
 * Listar alunos matriculados - professor/ADMIN ou alunos da turma
 * Query: page, limit, sortBy, sortOrder, search
 * Response: 200 { data: EnrollmentSummary[], pagination }
 */
router.get(
  "/:id/students",
  validateParams(classIdParamSchema),
  validateQuery(listClassesQuerySchema),
  classController.listStudents
);

/**
 * GET /classes/:id/subjects
 * Listar matérias da turma - professor/ADMIN ou alunos matriculados
 * Response: 200 { data: SubjectSummary[] }
 */
router.get(
  "/:id/subjects",
  validateParams(classIdParamSchema),
  classController.listClassSubjects
);

export default router;