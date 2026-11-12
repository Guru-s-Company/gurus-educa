import { prisma } from "../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  generateTokenId,
  type AccessTokenPayload,
} from "../lib/auth";
import { RoleCode } from "../../generated/prisma/enums";

/**
 * Erros de domínio da autenticação
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthErrors = {
  EMAIL_EXISTS: () => new AuthError("Email já cadastrado", "EMAIL_EXISTS", 409),
  CPF_EXISTS: () => new AuthError("CPF já cadastrado", "CPF_EXISTS", 409),
  INVALID_CREDENTIALS: () => new AuthError("Email ou senha inválidos", "INVALID_CREDENTIALS", 401),
  USER_INACTIVE: () => new AuthError("Usuário inativo", "USER_INACTIVE", 403),
  TOKEN_EXPIRED: () => new AuthError("Token expirado", "TOKEN_EXPIRED", 401),
  TOKEN_REVOKED: () => new AuthError("Token revogado", "TOKEN_REVOKED", 401),
  TOKEN_INVALID: () => new AuthError("Token inválido", "TOKEN_INVALID", 401),
  TOKEN_NOT_FOUND: () => new AuthError("Token não encontrado", "TOKEN_NOT_FOUND", 401),
};

/**
 * Resultado de operações de autenticação
 */
export interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Serviço de autenticação - contém toda a lógica de negócio
 */
export class AuthService {
  /**
   * Registra novo usuário
   * Cria User + UserRole(STUDENT) + gera tokens + salva refresh token hash
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    cpf: string;
    phone: string;
    education: string;
  }): Promise<AuthResult> {
    // Verifica se email já existe
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw AuthErrors.EMAIL_EXISTS();

    // Verifica se CPF já existe
    const existingCpf = await prisma.user.findUnique({ where: { cpf: data.cpf } });
    if (existingCpf) throw AuthErrors.CPF_EXISTS();

    // Hash da senha
    const passwordHash = await hashPassword(data.password);

    // Busca role STUDENT
    const studentRole = await prisma.role.findUniqueOrThrow({
      where: { code: RoleCode.STUDENT },
    });

    // Transação: cria usuário + role + refresh token
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          passwordHash,
          userRoles: {
            create: { roleId: studentRole.id },
          },
        },
        include: { userRoles: { include: { role: true } } },
      });

      // Gera tokens
      const tokenId = generateTokenId();
      const refreshToken = await createRefreshToken(user.id, tokenId);
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Salva refresh token no BD
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenHash,
          expiresAt,
        },
      });

      const accessToken = await createAccessToken(
        user.id,
        user.email,
        user.userRoles.map((ur) => ur.role.code)
      );

      return { user, accessToken, refreshToken };
    });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        roles: result.user.userRoles.map((ur) => ur.role.code),
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  /**
   * Login do usuário
   * Verifica credenciais, rota tokens (revoga antigo, cria novo)
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) throw AuthErrors.INVALID_CREDENTIALS();
    if (!user.isActive) throw AuthErrors.USER_INACTIVE();

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw AuthErrors.INVALID_CREDENTIALS();

    // Rotação de refresh token: revoga todos os tokens ativos do usuário
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Cria novo refresh token
    const tokenId = generateTokenId();
    const refreshToken = await createRefreshToken(user.id, tokenId);
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.userRoles.map((ur) => ur.role.code)
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.userRoles.map((ur) => ur.role.code),
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh de access token usando refresh token
   * Valida refresh token no BD, revoga o antigo, emite novos (rotação)
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verifica JWT
    let payload;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch {
      throw AuthErrors.TOKEN_INVALID();
    }

    const tokenId = payload.tokenId;
    const userId = Number(payload.sub);

    // Busca token no BD
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: hashRefreshToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) throw AuthErrors.TOKEN_REVOKED();

    // Revoga token atual (rotação)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Busca usuário com roles
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user.isActive) throw AuthErrors.USER_INACTIVE();

    // Cria novo par de tokens
    const newTokenId = generateTokenId();
    const newRefreshToken = await createRefreshToken(user.id, newTokenId);
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt,
      },
    });

    const accessToken = await createAccessToken(
      user.id,
      user.email,
      user.userRoles.map((ur) => ur.role.code)
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  // Logout - revoga refresh token específico
  
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Busca usuário por ID com roles (para middleware)

  async getUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
  }

  // Limpa tokens expirados/revogados (evita abuso de token expirado.)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    return result.count;
  }
}

export const authService = new AuthService();