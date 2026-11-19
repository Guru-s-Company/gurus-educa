import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../lib/errors";
import type {
  CreateSubmissionInput,
  GradeSubmissionInput,
  ListSubmissionsQuery,
  UploadSubmissionAttachmentInput,
  SubmissionResponse,
  SubmissionListItem,
} from "../lib/validators/submission";
import { generateStorageKey, generateUploadPresignedUrl, STORAGE_PREFIXES } from "../lib/storage";
import { SubmissionMode } from "../../generated/prisma/enums";

export class SubmissionService {
  /**
   * Cria entrega de atividade (aluno)
   */
  async createSubmission(
    userId: number,
    userRoles: string[],
    activityId: number,
    data: CreateSubmissionInput
  ): Promise<SubmissionResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classSubject: { include: { classGroup: { select: { id: true, teacherId: true } } } } },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    // Verifica se aluno está matriculado na turma
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classId: activity.classSubject.classGroupId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) throw new ForbiddenError("Você não está matriculado nesta turma");

    // Verifica se atividade está publicada
    if (!activity.isPublished) throw new ForbiddenError("Atividade não está publicada");

    // Verifica prazo
    const now = new Date();
    const isLate = activity.dueAt && now > activity.dueAt && !activity.allowLateSubmissions;
    if (isLate) throw new ForbiddenError("Prazo de entrega expirado e entregas tardias não são permitidas");

    // Verifica se já existe entrega para esta matrícula nesta atividade
    const existingMember = await prisma.submissionMember.findFirst({
      where: { activityId, enrollmentId: enrollment.id },
    });
    if (existingMember) throw new ConflictError("Você já entregou esta atividade");

    // Para trabalho em grupo, valida membros
    let memberEnrollmentIds = [enrollment.id];
    if (activity.submissionMode === SubmissionMode.GROUP && data.memberEnrollmentIds?.length) {
      // Verifica se todos os membros estão matriculados na turma
      const members = await prisma.enrollment.findMany({
        where: {
          id: { in: data.memberEnrollmentIds },
          classId: activity.classSubject.classGroupId,
          status: "ACTIVE",
        },
      });
      if (members.length !== data.memberEnrollmentIds.length) {
        throw new ValidationError("Um ou mais membros não estão matriculados nesta turma");
      }
      // Verifica se algum membro já entregou
      const existingMembers = await prisma.submissionMember.findMany({
        where: { activityId, enrollmentId: { in: data.memberEnrollmentIds } },
      });
      if (existingMembers.length > 0) {
        throw new ConflictError("Um ou mais membros já entregaram esta atividade");
      }
      memberEnrollmentIds = data.memberEnrollmentIds;
    }

    // Cria entrega + membros em transação
    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          textAnswer: data.textAnswer ?? null,
          activityId,
          members: {
            create: memberEnrollmentIds.map((eid) => ({ enrollmentId: eid })),
          },
        },
        include: {
          activity: { select: { title: true, submissionMode: true, dueAt: true, allowLateSubmissions: true } },
          members: { include: { enrollment: { include: { user: { select: { id: true, name: true, email: true } } } } } },
          attachments: true,
        },
      });
      return submission;
    });

    return this.formatSubmissionResponse(result, enrollment.id);
  }

  /**
   * Lista entregas de uma atividade (professor vê todas; aluno vê apenas própria)
   */
  async listSubmissions(
    userId: number,
    userRoles: string[],
    activityId: number,
    query: ListSubmissionsQuery
  ): Promise<{ data: SubmissionListItem[]; pagination: any }> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classSubject: { include: { classGroup: { select: { id: true, teacherId: true } } } } },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = activity.classSubject.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: activity.classSubject.classGroupId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso às entregas desta atividade");
    }

    const { page, limit, sortBy, sortOrder, status, enrollmentId } = query;

    // Aluno vê apenas sua entrega
    const where: any = { activityId };
    if (!isAdmin && !isOwner) {
      where.members = { some: { enrollment: { userId } } };
    } else if (enrollmentId) {
      where.members = { some: { enrollmentId } };
    }

    // Filtro por status (simplificado)
    if (status === "graded") where.grade = { not: null };
    else if (status === "pending") where.grade = null;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          activity: { select: { title: true } },
          members: { include: { enrollment: { include: { user: { select: { id: true, name: true, email: true } } } } } },
        },
        orderBy: { [sortBy ?? "submittedAt"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      data: submissions.map(this.formatSubmissionListItem),
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
   * Busca detalhes de uma entrega
   */
  async getSubmission(
    userId: number,
    userRoles: string[],
    submissionId: number
  ): Promise<SubmissionResponse> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        activity: {
          include: {
            classSubject: { include: { classGroup: { select: { id: true, teacherId: true } } } },
          },
        },
        members: { include: { enrollment: { include: { user: { select: { id: true, name: true, email: true } } } } } },
        attachments: true,
      },
    });

    if (!submission) throw new NotFoundError("Entrega", submissionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = submission.activity.classSubject.classGroup.teacherId === userId;
    const isMember = submission.members.some((m) => m.enrollment.userId === userId);

    if (!isAdmin && !isOwner && !isMember) {
      throw new ForbiddenError("Você não tem acesso a esta entrega");
    }

    // Encontra enrollmentId do usuário (se for membro)
    let userEnrollmentId: number | undefined;
    if (isMember) {
      const member = submission.members.find((m) => m.enrollment.userId === userId);
      userEnrollmentId = member?.enrollmentId;
    }

    return this.formatSubmissionResponse(submission, userEnrollmentId);
  }

  /**
   * Avalia entrega (professor)
   */
  async gradeSubmission(
    userId: number,
    userRoles: string[],
    submissionId: number,
    data: GradeSubmissionInput
  ): Promise<SubmissionResponse> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { activity: { include: { classSubject: { include: { classGroup: { select: { teacherId: true } } } } } } },
    });

    if (!submission) throw new NotFoundError("Entrega", submissionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = submission.activity.classSubject.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode avaliar entregas");
    }

    // Valida nota não exceder maxPoints
    if (data.grade > Number(submission.activity.maxPoints)) {
      throw new ValidationError(`Nota não pode exceder o máximo de ${submission.activity.maxPoints} pontos`);
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade,
        feedback: data.feedback ?? null,
      },
      include: {
        activity: {
          include: {
            classSubject: { include: { classGroup: { select: { id: true, teacherId: true } } } },
          },
        },
        members: { include: { enrollment: { include: { user: { select: { id: true, name: true, email: true } } } } } },
        attachments: true,
      },
    });

    return this.formatSubmissionResponse(updated);
  }

  /**
   * Gera URL pré-assinada para anexo na entrega
   */
  async generateAttachmentUploadUrl(
    userId: number,
    userRoles: string[],
    submissionId: number,
    data: UploadSubmissionAttachmentInput
  ): Promise<{ uploadUrl: string; key: string; attachmentId: number }> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        activity: {
          include: { classSubject: { include: { classGroup: { select: { id: true, teacherId: true } } } } },
        },
        members: { include: { enrollment: { select: { userId: true } } } },
      },
    });

    if (!submission) throw new NotFoundError("Entrega", submissionId);

    // Verifica se usuário é membro desta entrega
    const isMember = submission.members.some((m) => m.enrollment.userId === userId);
    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = submission.activity.classSubject.classGroup.teacherId === userId;

    if (!isMember && !isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para anexar arquivos a esta entrega");
    }

    const key = generateStorageKey(STORAGE_PREFIXES.SUBMISSION_ATTACHMENT, userId, data.fileName);
    const { uploadUrl } = await generateUploadPresignedUrl(key, data.mimeType);

    const attachment = await prisma.submissionAttachment.create({
      data: {
        fileName: data.fileName,
        url: key,
        mimeType: data.mimeType,
        submissionId,
      },
    });

    return { uploadUrl, key, attachmentId: attachment.id };
  }

  private formatSubmissionResponse(submission: any, userEnrollmentId?: number): SubmissionResponse {
    const now = new Date();
    const isLate = submission.activity.dueAt && submission.submittedAt > submission.activity.dueAt && !submission.activity.allowLateSubmissions;

    return {
      id: submission.id,
      activityId: submission.activityId,
      activityTitle: submission.activity.title,
      submittedAt: submission.submittedAt,
      textAnswer: submission.textAnswer,
      grade: submission.grade ? Number(submission.grade) : null,
      feedback: submission.feedback,
      isLate,
      submissionMode: submission.activity.submissionMode,
      members: submission.members.map((m: any) => ({
        enrollmentId: m.enrollmentId,
        studentId: m.enrollment.user.id,
        studentName: m.enrollment.user.name,
        studentEmail: m.enrollment.user.email,
      })),
      attachments: submission.attachments.map((a: any) => ({
        id: a.id,
        fileName: a.fileName,
        url: a.url,
        mimeType: a.mimeType,
        uploadedAt: a.uploadedAt,
      })),
    };
  }

  private formatSubmissionListItem(submission: any): SubmissionListItem {
    const isLate = submission.activity.dueAt && submission.submittedAt > submission.activity.dueAt && !submission.activity.allowLateSubmissions;

    return {
      id: submission.id,
      activityId: submission.activityId,
      activityTitle: submission.activity.title,
      submittedAt: submission.submittedAt,
      grade: submission.grade ? Number(submission.grade) : null,
      isLate,
      members: submission.members.map((m: any) => ({
        enrollmentId: m.enrollmentId,
        studentId: m.enrollment.user.id,
        studentName: m.enrollment.user.name,
        studentEmail: m.enrollment.user.email,
      })),
    };
  }
}

export const submissionService = new SubmissionService();