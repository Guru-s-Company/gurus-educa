import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";

/**
 * Estende Request para incluir helpers de permissão
 */
declare global {
  namespace Express {
    interface Request {
      /** Verifica se usuário pode gerenciar uma turma */
      canManageClass?: (classId: number) => Promise<boolean>;
      /** Verifica se usuário é professor da turma */
      isClassTeacher?: (classId: number) => Promise<boolean>;
      /** Verifica se usuário está matriculado na turma */
      isEnrolledInClass?: (classId: number) => Promise<boolean>;
      /** Verifica se usuário pode gerenciar organização */
      canManageOrganization?: (orgId: number) => Promise<boolean>;
      /** Verifica se usuário é membro ativo da organização */
      isOrgMember?: (orgId: number) => Promise<boolean>;
      /** Verifica se usuário pode gerenciar projeto */
      canManageProject?: (projectId: number) => Promise<boolean>;
      /** Verifica se usuário é membro do projeto */
      isProjectMember?: (projectId: number) => Promise<boolean>;
    }
  }
}

/**
 * Middleware que anexa helpers de permissão ao request
 * Deve vir APÓS requireAuth
 */
export async function attachPermissionHelpers(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  const userId = Number(req.user.sub);

  // Helper: pode gerenciar turma (professor responsável ou ADMIN)
  req.canManageClass = async (classId: number) => {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    if (!classGroup) return false;
    if (classGroup.teacherId === userId) return true;
    return req.user?.roles.includes("ADMIN") ?? false;
  };

  // Helper: é professor da turma
  req.isClassTeacher = async (classId: number) => {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    return classGroup?.teacherId === userId;
  };

  // Helper: está matriculado na turma (status ACTIVE)
  req.isEnrolledInClass = async (classId: number) => {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classId,
        status: "ACTIVE",
      },
    });
    return !!enrollment;
  };

  // Helper: pode gerenciar organização (owner ou permissão MANAGE_ORGANIZATION)
  req.canManageOrganization = async (orgId: number) => {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { ownerId: true, deletedAt: true },
    });
    if (!org || org.deletedAt) return false;
    if (org.ownerId === userId) return true;

    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        userId,
        status: "ACTIVE",
      },
      include: {
        role: {
          include: { permissions: true },
        },
        permissionOverrides: true,
      },
    });

    if (!membership) return false;

    // Verifica permissão direta
    const hasPermission = membership.role.permissions.some(
      (p) => p.permission === "MANAGE_ORGANIZATION" && p.allowed
    );
    if (hasPermission) return true;

    // Verifica override
    const override = membership.permissionOverrides.find(
      (o) => o.permission === "MANAGE_ORGANIZATION"
    );
    return override?.allowed ?? false;
  };

  // Helper: é membro ativo da organização
  req.isOrgMember = async (orgId: number) => {
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        userId,
        status: "ACTIVE",
      },
    });
    return !!membership;
  };

  // Helper: pode gerenciar projeto (owner ou permissão MANAGE_PROJECT)
  req.canManageProject = async (projectId: number) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerUserId: true,
        organizationId: true,
        deletedAt: true,
      },
    });
    if (!project || project.deletedAt) return false;

    // Projeto pessoal: só o owner
    if (project.ownerUserId) {
      return project.ownerUserId === userId;
    }

    // Projeto de organização: verifica permissão na org
    if (project.organizationId) {
      return req.canManageOrganization!(project.organizationId);
    }

    return false;
  };

  // Helper: é membro ativo do projeto
  req.isProjectMember = async (projectId: number) => {
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        status: "ACTIVE",
      },
    });
    return !!membership;
  };

  next();
}

/**
 * Middleware: exige que usuário possa gerenciar a turma
 * Uso: router.patch("/classes/:id", requireAuth, requireClassManagement, ...)
 */
export async function requireClassManagement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const classId = Number(req.params.id ?? req.params.classId);
    if (!classId || isNaN(classId)) {
      throw new ForbiddenError("ID da turma inválido");
    }

    const canManage = await req.canManageClass!(classId);
    if (!canManage) {
      throw new ForbiddenError("Você não tem permissão para gerenciar esta turma");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário seja professor da turma
 * Uso: router.post("/classes/:id/contents", requireAuth, requireClassTeacher, ...)
 */
export async function requireClassTeacher(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const classId = Number(req.params.id ?? req.params.classId);
    if (!classId || isNaN(classId)) {
      throw new ForbiddenError("ID da turma inválido");
    }

    const isTeacher = await req.isClassTeacher!(classId);
    if (!isTeacher) {
      throw new ForbiddenError("Apenas o professor responsável pode realizar esta ação");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário esteja matriculado na turma
 * Uso: router.get("/classes/:id/contents", requireAuth, requireEnrollment, ...)
 */
export async function requireEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const classId = Number(req.params.id ?? req.params.classId);
    if (!classId || isNaN(classId)) {
      throw new ForbiddenError("ID da turma inválido");
    }

    const isEnrolled = await req.isEnrolledInClass!(classId);
    const isTeacher = await req.isClassTeacher!(classId);
    const isAdmin = req.user?.roles.includes("ADMIN") ?? false;

    if (!isEnrolled && !isTeacher && !isAdmin) {
      throw new ForbiddenError("Você não está matriculado nesta turma");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário possa gerenciar a organização
 */
export async function requireOrganizationManagement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgId = Number(req.params.id ?? req.params.organizationId);
    if (!orgId || isNaN(orgId)) {
      throw new ForbiddenError("ID da organização inválido");
    }

    const canManage = await req.canManageOrganization!(orgId);
    if (!canManage) {
      throw new ForbiddenError("Você não tem permissão para gerenciar esta organização");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário seja membro da organização
 */
export async function requireOrgMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orgId = Number(req.params.id ?? req.params.organizationId);
    if (!orgId || isNaN(orgId)) {
      throw new ForbiddenError("ID da organização inválido");
    }

    const isMember = await req.isOrgMember!(orgId);
    if (!isMember) {
      throw new ForbiddenError("Você não é membro desta organização");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário possa gerenciar o projeto
 */
export async function requireProjectManagement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = Number(req.params.id ?? req.params.projectId);
    if (!projectId || isNaN(projectId)) {
      throw new ForbiddenError("ID do projeto inválido");
    }

    const canManage = await req.canManageProject!(projectId);
    if (!canManage) {
      throw new ForbiddenError("Você não tem permissão para gerenciar este projeto");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: exige que usuário seja membro do projeto
 */
export async function requireProjectMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = Number(req.params.id ?? req.params.projectId);
    if (!projectId || isNaN(projectId)) {
      throw new ForbiddenError("ID do projeto inválido");
    }

    const isMember = await req.isProjectMember!(projectId);
    const canManage = await req.canManageProject!(projectId);

    if (!isMember && !canManage) {
      throw new ForbiddenError("Você não é membro deste projeto");
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware genérico para verificar permissão específica na organização
 */
export function requireOrgPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = Number(req.params.id ?? req.params.organizationId);
      if (!orgId || isNaN(orgId)) {
        throw new ForbiddenError("ID da organização inválido");
      }

      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: orgId,
          userId: Number(req.user!.sub),
          status: "ACTIVE",
        },
        include: {
          role: { include: { permissions: true } },
          permissionOverrides: true,
        },
      });

      if (!membership) {
        throw new ForbiddenError("Você não é membro desta organização");
      }

      // Verifica permissão do role
      const hasPermission = membership.role.permissions.some(
        (p) => p.permission === permission && p.allowed
      );
      if (hasPermission) {
        next();
        return;
      }

      // Verifica override
      const override = membership.permissionOverrides.find(
        (o) => o.permission === permission
      );
      if (override?.allowed) {
        next();
        return;
      }

      throw new ForbiddenError(`Permissão necessária: ${permission}`);
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware genérico para verificar permissão específica no projeto
 */
export function requireProjectPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.id ?? req.params.projectId);
      if (!projectId || isNaN(projectId)) {
        throw new ForbiddenError("ID do projeto inválido");
      }

      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: Number(req.user!.sub),
          status: "ACTIVE",
        },
        include: {
          role: { include: { permissions: true } },
          permissionOverrides: true,
        },
      });

      if (!membership) {
        // Verifica se é owner do projeto pessoal
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { ownerUserId: true, organizationId: true },
        });
        if (project?.ownerUserId === Number(req.user!.sub)) {
          next();
          return;
        }
        throw new ForbiddenError("Você não é membro deste projeto");
      }

      // Verifica permissão do role
      const hasPermission = membership.role.permissions.some(
        (p) => p.permission === permission && p.allowed
      );
      if (hasPermission) {
        next();
        return;
      }

      // Verifica override
      const override = membership.permissionOverrides.find(
        (o) => o.permission === permission
      );
      if (override?.allowed) {
        next();
        return;
      }

      throw new ForbiddenError(`Permissão necessária: ${permission}`);
    } catch (err) {
      next(err);
    }
  };
}