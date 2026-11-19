import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate";
import { attendanceController } from "../controllers/attendance.controller";
import {
  createSessionSchema,
  updateSessionSchema,
  recordAttendanceSchema,
  recordBulkAttendanceSchema,
  listSessionsQuerySchema,
  classIdParamSchema,
  sessionIdParamSchema,
} from "../lib/validators/attendance";

const router = Router();

/**
 * Todas as rotas exigem autenticação
 */
router.use(requireAuth);

/**
 * POST /classes/:classId/sessions
 * Criar sessão/encontro - professor da turma
 * Body: CreateSessionInput
 * Response: 201 SessionResponse
 */
router.post(
  "/classes/:classId/sessions",
  validateParams(classIdParamSchema),
  validateBody(createSessionSchema),
  attendanceController.createSession
);

/**
 * GET /classes/:classId/sessions
 * Listar sessões da turma - professor, alunos matriculados, ADMIN
 * Query: ListSessionsQuery
 * Response: 200 { data: SessionResponse[], pagination }
 */
router.get(
  "/classes/:classId/sessions",
  validateParams(classIdParamSchema),
  validateQuery(listSessionsQuerySchema),
  attendanceController.listSessions
);

/**
 * GET /sessions/:id
 * Detalhes da sessão com presenças
 * Response: 200 SessionDetailResponse
 */
router.get(
  "/sessions/:id",
  validateParams(sessionIdParamSchema),
  attendanceController.getSession
);

/**
 * PATCH /sessions/:id
 * Atualizar sessão - professor dono ou ADMIN
 * Body: UpdateSessionInput
 * Response: 200 SessionResponse
 */
router.patch(
  "/sessions/:id",
  validateParams(sessionIdParamSchema),
  validateBody(updateSessionSchema),
  attendanceController.updateSession
);

/**
 * DELETE /sessions/:id
 * Excluir sessão - professor dono ou ADMIN
 * Response: 204
 */
router.delete(
  "/sessions/:id",
  validateParams(sessionIdParamSchema),
  attendanceController.deleteSession
);

/**
 * POST /sessions/:id/attendance
 * Registrar presença individual - professor da turma
 * Body: RecordAttendanceInput { enrollmentId, status, note? }
 * Response: 201 { attendanceId, message }
 */
router.post(
  "/sessions/:id/attendance",
  validateParams(sessionIdParamSchema),
  validateBody(recordAttendanceSchema),
  attendanceController.recordAttendance
);

/**
 * POST /sessions/:id/attendance/bulk
 * Registrar presença em lote - professor da turma
 * Body: RecordBulkAttendanceInput { records: RecordAttendanceInput[] }
 * Response: 201 { created, updated }
 */
router.post(
  "/sessions/:id/attendance/bulk",
  validateParams(sessionIdParamSchema),
  validateBody(recordBulkAttendanceSchema),
  attendanceController.recordBulkAttendance
);

/**
 * GET /sessions/:id/attendance
 * Ver presença da sessão - professor/alunos da turma
 * Response: 200 SessionDetailResponse
 */
router.get(
  "/sessions/:id/attendance",
  validateParams(sessionIdParamSchema),
  attendanceController.getSessionAttendance
);

/**
 * GET /me/attendance
 * Minha presença - aluno matriculado
 * Query: classId (obrigatório)
 * Response: 200 { data: MyAttendanceResponse[], pagination }
 */
router.get(
  "/me/attendance",
  attendanceController.getMyAttendance
);

export default router;