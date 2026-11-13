import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { authService } from "../services/auth.service";
import { requireAuth } from "../middlewares/auth";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type LogoutInput,
} from "../lib/validators/auth";

const router = Router();

/**
 * Middleware genérico de validação de body com Zod
 * Retorna 400 formatado se validação falhar
 */
function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Dados de entrada inválidos",
          details: err.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
}

/**
 * POST /auth/register
 * Registra novo usuário e retorna tokens
 * Body: RegisterInput
 * Response: 201 { user, accessToken, refreshToken }
 */
router.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/login
 * Autentica usuário e retorna tokens
 * Body: LoginInput
 * Response: 200 { user, accessToken, refreshToken }
 */
router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/refresh
 * Renova access token usando refresh token (rotação)
 * Body: RefreshInput
 * Response: 200 { accessToken, refreshToken }
 */
router.post(
  "/refresh",
  validateBody(refreshSchema),
  async (req: Request<{}, {}, RefreshInput>, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/logout
 * Revoga refresh token (requer access token válido)
 * Headers: Authorization: Bearer <accessToken>
 * Body: LogoutInput
 * Response: 204
 */
router.post(
  "/logout",
  requireAuth,
  validateBody(logoutSchema),
  async (req: Request<{}, {}, LogoutInput>, res: Response, next: NextFunction) => {
    try {
      await authService.logout(req.body.refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /auth/me
 * Retorna dados do usuário autenticado
 * Headers: Authorization: Bearer <accessToken>
 * Response: 200 { user }
 */
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Não autenticado" });
      return;
    }

    const user = await authService.getUserById(Number(req.user.sub));
    if (!user) {
      res.status(404).json({ error: "NOT_FOUND", message: "Usuário não encontrado" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.userRoles.map((ur) => ur.role.code),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;