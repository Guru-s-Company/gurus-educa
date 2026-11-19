import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import classRoutes from "./routes/classes";
import subjectRoutes from "./routes/subjects";
import contentRoutes from "./routes/contents";
import activityRoutes from "./routes/activities";
import submissionRoutes from "./routes/submissions";
import attendanceRoutes from "./routes/attendance";
import { AuthError } from "./services/auth.service";
import { AppError, isAppError } from "./lib/errors";

const app = express();

// CORS configurado para o frontend Vite (porta 5173)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Request logging (desenvolvimento)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check (público)
app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", db: "up" });
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rotas de perfil
app.use("/profile", profileRoutes);

// ============================================================
// FASE 1: GESTÃO ACADÊMICA
// ============================================================

// Turmas
app.use("/classes", classRoutes);

// Matérias (catálogo + associação turma-matéria)
app.use("/subjects", subjectRoutes);

// Conteúdos educacionais
app.use("/contents", contentRoutes);

// Atividades
app.use("/activities", activityRoutes);

// Entregas
app.use("/submissions", submissionRoutes);

// Presença
app.use("/attendance", attendanceRoutes);

// Exemplo de rota protegida (para teste)
app.get("/auth/protected", async (req, res) => {
  res.json({ message: "Rota protegida funcionando!", user: (req as any).user });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  // Erros de domínio da aplicação (AppError e subclasses)
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Erros de autenticação legados
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Erros de validação Zod (fallback)
  if (err.name === "ZodError") {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Dados de entrada inválidos",
    });
    return;
  }

  // Erros de Prisma (unique constraint, etc.)
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      const field = prismaErr.meta?.target?.[0] ?? "campo";
      res.status(409).json({
        error: "CONFLICT",
        message: `${field} já cadastrado`,
      });
      return;
    }
  }

  // Erro genérico
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
      : err.message,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Rota não encontrada" });
});

const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Auth routes: http://localhost:${port}/auth/*`);
  console.log(`Profile routes: http://localhost:${port}/profile/*`);
  console.log(`Classes routes: http://localhost:${port}/classes/*`);
  console.log(`Subjects routes: http://localhost:${port}/subjects/*`);
  console.log(`Contents routes: http://localhost:${port}/contents/*`);
  console.log(`Activities routes: http://localhost:${port}/activities/*`);
  console.log(`Submissions routes: http://localhost:${port}/submissions/*`);
  console.log(`Attendance routes: http://localhost:${port}/attendance/*`);
});