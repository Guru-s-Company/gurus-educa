import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", db: "up" });
});

const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});