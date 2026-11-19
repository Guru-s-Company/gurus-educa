import type { Request, Response, NextFunction } from "express";
import { subjectService } from "../services/subject.service";
import { NotFoundError } from "../lib/errors";
import type { ListSubjectsQuery } from "../lib/validators/subject";

export class SubjectController {
  /**
   * POST /subjects
   * Criar matéria no catálogo (ADMIN)
   */
  async createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const result = await subjectService.createSubject(req.user.roles, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /subjects
   * Listar catálogo de matérias
   */
  async listSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectService.listSubjects(req.query as unknown as ListSubjectsQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /classes/:classId/subjects
   * Adicionar matéria à turma (professor/ADMIN)
   */
  async addSubjectToClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await subjectService.addSubjectToClass(
        Number(req.user.sub),
        req.user.roles,
        classId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /classes/:classId/subjects/:subjectId
   * Remover matéria da turma (professor/ADMIN)
   */
  async removeSubjectFromClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const subjectId = Number(req.params.subjectId);
      await subjectService.removeSubjectFromClass(
        Number(req.user.sub),
        req.user.roles,
        classId,
        subjectId
      );
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
   * GET /classes/:classId/subjects
   * Listar matérias da turma
   */
  async listClassSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await subjectService.listClassSubjects(
        Number(req.user.sub),
        req.user.roles,
        classId
      );
      res.json({ data: result });
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }
}

export const subjectController = new SubjectController();