import type { Request, Response, NextFunction } from "express";
import { attendanceService } from "../services/attendance.service";
import { NotFoundError } from "../lib/errors";
import type { ListSessionsQuery } from "../lib/validators/attendance";

export class AttendanceController {
  /**
   * POST /classes/:classId/sessions
   * Criar sessão/encontro (professor da turma)
   */
  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await attendanceService.createSession(
        Number(req.user.sub),
        req.user.roles,
        classId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /classes/:classId/sessions
   * Listar sessões da turma
   */
  async listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await attendanceService.listSessions(
        Number(req.user.sub),
        req.user.roles,
        classId,
        req.query as unknown as ListSessionsQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /sessions/:id
   * Detalhes da sessão com presenças
   */
  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      const result = await attendanceService.getSession(
        Number(req.user.sub),
        req.user.roles,
        sessionId
      );
      res.json(result);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /sessions/:id
   * Atualizar sessão (professor dono/ADMIN)
   */
  async updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      const result = await attendanceService.updateSession(
        Number(req.user.sub),
        req.user.roles,
        sessionId,
        req.body
      );
      res.json(result);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /sessions/:id
   * Excluir sessão (professor dono/ADMIN)
   */
  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      await attendanceService.deleteSession(Number(req.user.sub), req.user.roles, sessionId);
      res.status(204).send();
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }

  /**
   * POST /sessions/:id/attendance
   * Registrar presença individual (professor)
   */
  async recordAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      const result = await attendanceService.recordAttendance(
        Number(req.user.sub),
        req.user.roles,
        sessionId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/attendance/bulk
   * Registrar presença em lote (professor)
   */
  async recordBulkAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      const result = await attendanceService.recordBulkAttendance(
        Number(req.user.sub),
        req.user.roles,
        sessionId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /sessions/:id/attendance
   * Ver presença da sessão (professor/alunos da turma)
   */
  async getSessionAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const sessionId = Number(req.params.id);
      const result = await attendanceService.getSessionAttendance(
        Number(req.user.sub),
        req.user.roles,
        sessionId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /me/attendance?classId=X
   * Minha presença (aluno)
   */
  async getMyAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.query.classId);
      if (!classId || isNaN(classId)) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: "Parâmetro classId é obrigatório" });
        return;
      }
      const result = await attendanceService.getMyAttendance(Number(req.user.sub), classId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const attendanceController = new AttendanceController();