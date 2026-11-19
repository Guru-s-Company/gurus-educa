import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../lib/errors";
import type {
  CreateContentInput,
  UpdateContentInput,
  ListContentsQuery,
  UploadAttachmentInput,
  ContentResponse,
  ContentAttachmentResponse,
} from "../lib/validators/content";
import { generateStorageKey, generateUploadPresignedUrl, generateDownloadPresignedUrl, STORAGE_PREFIXES } from "../lib/storage";

export class ContentService {
  /**
   * Cria material educacional na turma
   * Professor da turma ou ADMIN
   */
  async createContent(
    userId: number,
    userRoles: string[],
    classId: number,
    data: CreateContentInput
  ): Promise<ContentResponse> {
    // Verifica turma e permissões
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode criar materiais");
    }

    // Se classSubjectId informado, verifica se pertence à turma
    if (data.classSubjectId) {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: data.classSubjectId },
        select: { classGroupId: true },
      });
      if (!classSubject || classSubject.classGroupId !== classId) {
        throw new ValidationError("Matéria não pertence a esta turma");
      }
    }

    const content = await prisma.learningContent.create({
      data: {
        title: data.title,
        body: data.body ?? null,
        classGroupId: classId,
        classSubjectId: data.classSubjectId ?? null,
        createdById: userId,
      },
      include: {
        classSubject: { include: { subject: true } },
        createdBy: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    return this.formatContentResponse(content);
  }

  /**
   * Lista materiais da turma
   * Professor, alunos matriculados, ADMIN
   */
  async listContents(
    userId: number,
    userRoles: string[],
    classId: number,
    query: ListContentsQuery
  ): Promise<{ data: ContentResponse[]; pagination: any }> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso aos materiais desta turma");
    }

    const { page, limit, sortBy, sortOrder, classSubjectId, search } = query;

    const where: any = { classGroupId: classId };
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contents, total] = await Promise.all([
      prisma.learningContent.findMany({
        where,
        include: {
          classSubject: { include: { subject: true } },
          createdBy: { select: { id: true, name: true } },
          attachments: true,
        },
        orderBy: { [sortBy ?? "createdAt"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.learningContent.count({ where }),
    ]);

    return {
      data: contents.map(this.formatContentResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Busca detalhes de um material
   */
  async getContent(
    userId: number,
    userRoles: string[],
    contentId: number
  ): Promise<ContentResponse> {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: {
        classGroup: { select: { id: true, teacherId: true } },
        classSubject: { include: { subject: true } },
        createdBy: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    if (!content) throw new NotFoundError("Material", contentId);

    // Verifica acesso
    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = content.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: content.classGroupId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso a este material");
    }

    return this.formatContentResponse(content);
  }

  /**
   * Atualiza material
   * Professor dono ou ADMIN
   */
  async updateContent(
    userId: number,
    userRoles: string[],
    contentId: number,
    data: UpdateContentInput
  ): Promise<ContentResponse> {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!content) throw new NotFoundError("Material", contentId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = content.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor que criou pode atualizar este material");
    }

    // Valida classSubjectId se informado
    if (data.classSubjectId !== undefined) {
      if (data.classSubjectId !== null) {
        const classSubject = await prisma.classSubject.findUnique({
          where: { id: data.classSubjectId },
          select: { classGroupId: true },
        });
        if (!classSubject || classSubject.classGroupId !== content.classGroupId) {
          throw new ValidationError("Matéria não pertence a esta turma");
        }
      }
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const updated = await prisma.learningContent.update({
      where: { id: contentId },
      data: updateData,
      include: {
        classSubject: { include: { subject: true } },
        createdBy: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    return this.formatContentResponse(updated);
  }

  /**
   * Exclui material
   * Professor dono ou ADMIN
   */
  async deleteContent(userId: number, userRoles: string[], contentId: number): Promise<void> {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!content) throw new NotFoundError("Material", contentId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = content.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor que criou pode excluir este material");
    }

    // Deleta anexos do storage (opcional - pode manter para auditoria)
    // await Promise.all(content.attachments.map(a => deleteObject(a.storageKey)));

    await prisma.learningContent.delete({ where: { id: contentId } });
  }

  /**
   * Gera URL pré-assinada para upload de anexo
   */
  async generateAttachmentUploadUrl(
    userId: number,
    userRoles: string[],
    contentId: number,
    data: UploadAttachmentInput
  ): Promise<{ uploadUrl: string; key: string; attachmentId: number }> {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!content) throw new NotFoundError("Material", contentId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = content.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: content.classGroupId, userId, status: "ACTIVE" },
    });

    // Professor ou aluno matriculado pode anexar
    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem permissão para anexar arquivos a este material");
    }

    const key = generateStorageKey(STORAGE_PREFIXES.CONTENT_ATTACHMENT, userId, data.fileName);
    const { uploadUrl } = await generateUploadPresignedUrl(key, data.mimeType);

    // Cria registro de anexo pendente (será confirmado após upload)
    const attachment = await prisma.contentAttachment.create({
      data: {
        fileName: data.fileName,
        url: key, // Salva a key; URL final será construída no frontend
        mimeType: data.mimeType,
        contentId,
      },
    });

    return { uploadUrl, key, attachmentId: attachment.id };
  }

  /**
   * Confirma upload de anexo (chamado pelo frontend após upload bem-sucedido)
   */
  async confirmAttachmentUpload(
    userId: number,
    attachmentId: number
  ): Promise<ContentAttachmentResponse> {
    const attachment = await prisma.contentAttachment.findUnique({
      where: { id: attachmentId },
      include: { content: { include: { classGroup: true } } },
    });

    if (!attachment) throw new NotFoundError("Anexo", attachmentId);

    // Verifica permissão (mesma do upload)
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: attachment.content.classGroupId, userId, status: "ACTIVE" },
    });

    const content = await prisma.learningContent.findUnique({
      where: { id: attachment.contentId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    const isAdmin = (await prisma.user.findUnique({ where: { id: userId }, include: { userRoles: { include: { role: true } } } }))?.userRoles.some(ur => ur.role.code === "ADMIN");
    const isOwner = content?.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem permissão para confirmar este anexo");
    }

    // Gera URL de download assinada
    const downloadUrl = await generateDownloadPresignedUrl(attachment.url);

    const updated = await prisma.contentAttachment.update({
      where: { id: attachmentId },
      data: { url: downloadUrl },
    });

    return {
      id: updated.id,
      fileName: updated.fileName,
      url: updated.url,
      mimeType: updated.mimeType,
      createdAt: updated.createdAt,
    };
  }

  private formatContentResponse(content: any): ContentResponse {
    return {
      id: content.id,
      title: content.title,
      body: content.body,
      classGroupId: content.classGroupId,
      classSubjectId: content.classSubjectId,
      classSubjectName: content.classSubject?.subject?.name ?? null,
      createdById: content.createdById,
      createdByName: content.createdBy?.name ?? null,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      attachments: content.attachments?.map((a: any) => ({
        id: a.id,
        fileName: a.fileName,
        url: a.url,
        mimeType: a.mimeType,
        createdAt: a.createdAt,
      })) ?? [],
    };
  }
}

export const contentService = new ContentService();