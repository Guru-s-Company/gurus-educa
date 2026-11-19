import type { Request, Response, NextFunction } from "express";
import { classService } from "../services/class.service";
import { NotFoundError } from "../lib/errors";
import type { ListClassesQuery } from "../lib/validators/class";

export class ClassController {
  /**
   * POST /classes
   * Criar turma (TEACHER/ADMIN)
   */
  async createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const result = await classService.createClass(
        Number(req.user.sub),
        req.user.roles,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /classes
   * Listar turmas (filtros: professor, aluno, busca)
   */
  async listClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const result = await classService.listClasses(
        Number(req.user.sub),
        req.user.roles,
        req.query as unknown as ListClassesQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /classes/:id
   * Detalhes da turma
   */
  async getClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const result = await classService.getClass(
        Number(req.user.sub),
        req.user.roles,
        classId
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
   * PATCH /classes/:id
   * Atualizar turma (dono/ADMIN)
   */
  async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const result = await classService.updateClass(
        Number(req.user.sub),
        req.user.roles,
        classId,
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
   * DELETE /classes/:id
   * Excluir turma (dono/ADMIN)
   */
  async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      await classService.deleteClass(Number(req.user.sub), req.user.roles, classId);
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
   * POST /classes/:id/enroll
   * Matricular aluno (professor/ADMIN)
   */
  async enrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const result = await classService.enrollStudent(
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
   * DELETE /classes/:id/enroll/:enrollmentId
   * Remover matrícula (professor/ADMIN/aluno dono)
   */
  async removeEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const enrollmentId = Number(req.params.enrollmentId);
      await classService.removeEnrollment(
        Number(req.user.sub),
        req.user.roles,
        classId,
        enrollmentId
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
   * GET /classes/:id/students
   * Listar alunos matriculados
   */
  async listStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const result = await classService.listStudents(
        Number(req.user.sub),
        req.user.roles,
        classId,
        req.query as unknown as ListClassesQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /classes/:id/subjects
   * Listar matérias da turma
   */
  async listClassSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.id);
      const result = await classService.listClassSubjects(
        Number(req.user.sub),
        req.user.roles,
        classId
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const classController = new ClassController();