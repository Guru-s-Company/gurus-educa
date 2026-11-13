export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} não encontrado (id: ${id})` : `${resource} não encontrado`;
    super(message, "NOT_FOUND", 404, { resource, id });
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado", details?: unknown) {
    super(message, "FORBIDDEN", 403, details);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado", details?: unknown) {
    super(message, "UNAUTHORIZED", 401, details);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFLICT", 409, details);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Dados inválidos", details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Muitas requisições", details?: unknown) {
    super(message, "TOO_MANY_REQUESTS", 429, details);
    this.name = "TooManyRequestsError";
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}