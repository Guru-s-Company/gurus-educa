import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import { ValidationError } from "../lib/errors";

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ValidationError("Dados de entrada inválidos", err.issues.map((issue) => ({
          path: Array.isArray(issue.path) ? issue.path.join(".") : String(issue.path),
          message: issue.message,
        })));
      }
      next(err);
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ValidationError("Parâmetros de consulta inválidos", err.issues.map((issue) => ({
          path: Array.isArray(issue.path) ? issue.path.join(".") : String(issue.path),
          message: issue.message,
        })));
      }
      next(err);
    }
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.params);
      Object.assign(req.params, parsed);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ValidationError("Parâmetros de rota inválidos", err.issues.map((issue) => ({
          path: Array.isArray(issue.path) ? issue.path.join(".") : String(issue.path),
          message: issue.message,
        })));
      }
      next(err);
    }
  };
}