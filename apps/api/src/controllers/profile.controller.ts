import type { Request, Response, NextFunction } from "express";
import { profileService } from "../services/profile.service";
import { NotFoundError } from "../lib/errors";

export class ProfileController {
  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const profile = await profileService.getMyProfile(Number(req.user.sub));
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.params.id);
      const profile = await profileService.getPublicProfile(userId);
      res.json({ profile });
    } catch (err) {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: "NOT_FOUND", message: err.message });
        return;
      }
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      const profile = await profileService.updateProfile(Number(req.user.sub), req.body);
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      await profileService.changePassword(Number(req.user.sub), req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async deactivateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
        return;
      }
      await profileService.deactivateAccount(Number(req.user.sub));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();