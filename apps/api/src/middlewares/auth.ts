import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../lib/auth";
import { authService } from "../services/auth.service";

/**
 * Estende Request do Express para incluir usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Middleware que exige autenticação válida
 * Extrai Bearer token do header Authorization, valida, anexa req.user
 * Retorna 401 se token ausente, inválido ou expirado
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Token de acesso não fornecido",
      });
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    let payload: AccessTokenPayload;
    try {
      payload = await verifyAccessToken(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Token inválido";
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: message.includes("expired") ? "Token expirado" : "Token inválido",
      });
      return;
    }

    // Verifica se usuário ainda existe e está ativo
    const user = await authService.getUserById(Number(payload.sub));
    if (!user || !user.isActive) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Usuário não encontrado ou inativo",
      });
      return;
    }

    // Anexa payload ao request
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware opcional - anexa usuário se token válido, continua se não houver
 * Útil para rotas que personalizam resposta baseada em auth mas não exigem
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyAccessToken(token);
      const user = await authService.getUserById(Number(payload.sub));
      if (user && user.isActive) {
        req.user = payload;
      }
    } catch {
      // Token inválido - ignora e continua sem usuário
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware para verificar roles específicos
 * Uso: requireRole("ADMIN"), requireRole(["TEACHER", "ADMIN"])
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Autenticação necessária",
      });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: "Permissão insuficiente",
      });
      return;
    }

    next();
  };
}