import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import { AuthError } from "./services/auth.service";

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

// Exemplo de rota protegida (para teste)
app.get("/auth/protected", async (req, res) => {
  // Este middleware será adicionado depois
  res.json({ message: "Rota protegida funcionando!", user: (req as any).user });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);

  // Erros de domínio da autenticação
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Erros de validação Zod (já tratados no middleware, mas fallback)
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
});