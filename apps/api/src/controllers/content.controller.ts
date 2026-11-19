import type { Request, Response, NextFunction } from "express";
import { contentService } from "../services/content.service";
import { NotFoundError } from "../lib/errors";
import type { ListContentsQuery } from "../lib/validators/content";

export class ContentController {
  /**
   * POST /classes/:classId/contents
   * Criar material (professor da turma)
   */
  async createContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await contentService.createContent(
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
   * GET /classes/:classId/contents
   * Listar materiais da turma
   */
  async listContents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const classId = Number(req.params.classId);
      const result = await contentService.listContents(
        Number(req.user.sub),
        req.user.roles,
        classId,
        req.query as unknown as ListContentsQuery
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /contents/:id
   * Detalhes do material
   */
  async getContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const contentId = Number(req.params.id);
      const result = await contentService.getContent(
        Number(req.user.sub),
        req.user.roles,
        contentId
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
   * PATCH /contents/:id
   * Atualizar material (professor dono/ADMIN)
   */
  async updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const contentId = Number(req.params.id);
      const result = await contentService.updateContent(
        Number(req.user.sub),
        req.user.roles,
        contentId,
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
   * DELETE /contents/:id
   * Excluir material (professor dono/ADMIN)
   */
  async deleteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const contentId = Number(req.params.id);
      await contentService.deleteContent(Number(req.user.sub), req.user.roles, contentId);
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
   * POST /contents/:id/attachments
   * Gerar URL pré-assinada para upload de anexo
   */
  async generateAttachmentUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const contentId = Number(req.params.id);
      const result = await contentService.generateAttachmentUploadUrl(
        Number(req.user.sub),
        req.user.roles,
        contentId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /attachments/:attachmentId/confirm
   * Confirmar upload de anexo (chamado pelo frontend após upload)
   */
  async confirmAttachmentUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const attachmentId = Number(req.params.attachmentId);
      const result = await contentService.confirmAttachmentUpload(
        Number(req.user.sub),
        attachmentId
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
}

export const contentController = new ContentController();