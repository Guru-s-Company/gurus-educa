import type { Request, Response, NextFunction } from "express";
import { activityService } from "../services/activity.service";
import { NotFoundError } from "../lib/errors";
import type { ListActivitiesQuery } from "../lib/validators/activity";

export class ActivityController {
  /**
   * POST /class-subjects/:classSubjectId/activities
   * Criar atividade (professor da turma)
   */
  async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classSubjectId = Number(req.params.classSubjectId);
      const result = await activityService.createActivity(
        Number(req.user.sub),
        req.user.roles,
        classSubjectId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /class-subjects/:classSubjectId/activities
   * Listar atividades da matéria
   */
  async listActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classSubjectId = Number(req.params.classSubjectId);
      const result = await activityService.listActivities(
        Number(req.user.sub),
        req.user.roles,
        classSubjectId,
        req.query as unknown as ListActivitiesQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /activities/:id
   * Detalhes da atividade
   */
  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      const result = await activityService.getActivity(
        Number(req.user.sub),
        req.user.roles,
        activityId
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
   * PATCH /activities/:id
   * Atualizar atividade (professor dono/ADMIN)
   */
  async updateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      const result = await activityService.updateActivity(
        Number(req.user.sub),
        req.user.roles,
        activityId,
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
   * PATCH /activities/:id/publish
   * Publicar/Despublicar atividade (professor/ADMIN)
   * Body: { publish: boolean }
   */
  async togglePublishActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      const { publish } = req.body;
      if (typeof publish !== "boolean") {
        res.status(400).json({ error: "VALIDATION_ERROR", message: "Campo 'publish' (boolean) é obrigatório" });
        return;
      }
      const result = await activityService.togglePublishActivity(
        Number(req.user.sub),
        req.user.roles,
        activityId,
        publish
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
   * DELETE /activities/:id
   * Excluir atividade (professor dono/ADMIN)
   */
  async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const activityId = Number(req.params.id);
      await activityService.deleteActivity(Number(req.user.sub), req.user.roles, activityId);
      res.status(204).send();
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }
}

export const activityController = new ActivityController();