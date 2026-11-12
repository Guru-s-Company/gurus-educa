import argon2 from "argon2";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createHash, randomUUID } from "node:crypto";

/**
 * Configuração do Argon2id (recomendado pela OWASP)
 * memory: 64 MB, iterations: 3, parallelism: 4
 * Equilibra segurança e performance para aplicações web
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3,         // 3 iterações
  parallelism: 4,      // 4 threads
  hashLength: 32,      // 32 bytes output
} as const;

/**
 * Chaves para JWT (em produção, use chaves RSA/Ed25519 rotacionadas)
 * Para desenvolvimento, geramos chaves simétricas a partir de secrets
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-32-chars";
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-in-production-min-32-chars";
  return new TextEncoder().encode(secret);
}

/**
 * Gera hash da senha usando Argon2id
 * @param password - Senha em texto plano
 * @returns Hash codificado (formato: $argon2id$v=19$m=65536,t=3,p=4$salt$hash)
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verifica senha contra hash Argon2id
 * @param password - Senha em texto plano
 * @param hash - Hash armazenado no banco
 * @returns true se a senha confere
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Payload do Access Token (curta duração: 15 min)
 */
export interface AccessTokenPayload extends JWTPayload {
  sub: string;        // user ID
  email: string;
  roles: string[];    // ex: ["STUDENT", "TEACHER"]
  type: "access";
}

/**
 * Payload do Refresh Token (longa duração: 7 dias)
 */
export interface RefreshTokenPayload extends JWTPayload {
  sub: string;        // user ID
  tokenId: string;    // ID único do token (para rotação/revogação)
  type: "refresh";
}

/**
 * Cria Access Token (JWT assinado com HS256)
 * @param userId - ID do usuário
 * @param email - Email do usuário
 * @param roles - Roles do usuário
 * @returns Token JWT compacto
 */
export async function createAccessToken(
  userId: number,
  email: string,
  roles: string[]
): Promise<string> {
  const payload: AccessTokenPayload = {
    sub: String(userId),
    email,
    roles,
    type: "access",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutos
  };

  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecret());
}

/**
 * Cria Refresh Token (JWT assinado com HS256)
 * @param userId - ID do usuário
 * @param tokenId - ID único para este token (UUID v4 recomendado)
 * @returns Token JWT compacto
 */
export async function createRefreshToken(userId: number, tokenId: string): Promise<string> {
  const payload: RefreshTokenPayload = {
    sub: String(userId),
    tokenId,
    type: "refresh",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 dias
  };

  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret());
}

/**
 * Verifica e decodifica Access Token
 * @param token - JWT compacto
 * @returns Payload decodificado se válido
 * @throws se token inválido, expirado ou malformado
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  if (payload.type !== "access") {
    throw new Error("Token type mismatch: expected access token");
  }

  return payload as unknown as AccessTokenPayload;
}

/**
 * Verifica e decodifica Refresh Token
 * @param token - JWT compacto
 * @returns Payload decodificado se válido
 * @throws se token inválido, expirado ou malformado
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret(), {
    algorithms: ["HS256"],
  });

  if (payload.type !== "refresh") {
    throw new Error("Token type mismatch: expected refresh token");
  }

  return payload as unknown as RefreshTokenPayload;
}

/**
 * Gera hash SHA-256 do refresh token para armazenamento seguro no BD
 * Nunca armazene o token em texto plano!
 * @param token - Refresh token JWT
 * @returns Hash hexadecimal
 */
export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Gera ID único para refresh token (UUID v4)
 */
export function generateTokenId(): string {
  return randomUUID();
}