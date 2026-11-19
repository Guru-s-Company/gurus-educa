import type { Request, Response, NextFunction } from "express";
import { submissionService } from "../services/submission.service";
import { NotFoundError } from "../lib/errors";
import type { ListSubmissionsQuery } from "../lib/validators/submission";

export class SubmissionController {
  /**
   * POST /activities/:id/submissions
   * Entregar atividade (aluno)
   */
  async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      const result = await submissionService.createSubmission(
        Number(req.user.sub),
        req.user.roles,
        activityId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /activities/:id/submissions
   * Listar entregas da atividade (professor vê todas, aluno vê própria)
   */
  async listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      const result = await submissionService.listSubmissions(
        Number(req.user.sub),
        req.user.roles,
        activityId,
        req.query as unknown as ListSubmissionsQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /submissions/:id
   * Detalhes da entrega
   */
  async getSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const submissionId = Number(req.params.id);
      const result = await submissionService.getSubmission(
        Number(req.user.sub),
        req.user.roles,
        submissionId
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
   * PATCH /submissions/:id/grade
   * Avaliar entrega (professor)
   */
  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const submissionId = Number(req.params.id);
      const result = await submissionService.gradeSubmission(
        Number(req.user.sub),
        req.user.roles,
        submissionId,
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
   * POST /submissions/:id/attachments
   * Gerar URL pré-assinada para anexo na entrega
   */
  async generateAttachmentUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const submissionId = Number(req.params.id);
      const result = await submissionService.generateAttachmentUploadUrl(
        Number(req.user.sub),
        req.user.roles,
        submissionId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const submissionController = new SubmissionController();