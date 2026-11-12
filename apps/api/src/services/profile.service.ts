import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/auth";
import { NotFoundError, ForbiddenError, ConflictError } from "../lib/errors";
import type { UpdateProfileInput, ChangePasswordInput } from "../lib/validators/profile";
import { EducationLevel } from "../../generated/prisma/enums";

export interface PublicProfile {
  id: number;
  name: string;
  email: string;
  education: string | null;
  createdAt: Date;
}

export interface FullProfile extends PublicProfile {
  phone: string;
  roles: string[];
  isActive: boolean;
}

export class ProfileService {
  async getMyProfile(userId: number): Promise<FullProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) throw new NotFoundError("Usuário", userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      education: user.education,
      isActive: user.isActive,
      roles: user.userRoles.map((ur) => ur.role.code),
      createdAt: user.createdAt,
    };
  }

  async getPublicProfile(userId: number): Promise<PublicProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        education: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError("Usuário", userId);

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileInput): Promise<FullProfile> {
    console.log("[DEBUG] updateProfile called with:", data);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuário", userId);

    if (data.phone && data.phone !== user.phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } });
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictError("Telefone já cadastrado");
      }
    }

    const educationMap = {
      "ensino-fundamental": EducationLevel.ENSINO_FUNDAMENTAL,
      "ensino-medio": EducationLevel.ENSINO_MEDIO,
      "graduacao": EducationLevel.GRADUACAO,
      "pos-graduacao": EducationLevel.POS_GRADUACAO,
    } as const;

    const updateData: Record<string, unknown> = {};
    if (data.fullName !== undefined) updateData.name = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.education !== undefined) {
      const mapped = educationMap[data.education as keyof typeof educationMap];
      console.log("[DEBUG] education input:", data.education, "mapped:", mapped);
      updateData.education = mapped;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { userRoles: { include: { role: true } } },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      education: updated.education,
      isActive: updated.isActive,
      roles: updated.userRoles.map((ur) => ur.role.code),
      createdAt: updated.createdAt,
    };
  }

  async changePassword(userId: number, data: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuário", userId);

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenError("Senha atual incorreta");

    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deactivateAccount(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuário", userId);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  }
}

export const profileService = new ProfileService();