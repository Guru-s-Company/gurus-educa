import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../lib/errors";
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ListActivitiesQuery,
  ActivityResponse,
} from "../lib/validators/activity";

export class ActivityService {
  /**
   * Cria atividade na matéria da turma
   * Professor da turma ou ADMIN
   */
  async createActivity(
    userId: number,
    userRoles: string[],
    classSubjectId: number,
    data: CreateActivityInput
  ): Promise<ActivityResponse> {
    // Verifica ClassSubject e permissões
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!classSubject) throw new NotFoundError("Matéria da turma", classSubjectId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classSubject.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode criar atividades");
    }

    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        dueAt: data.dueAt ?? null,
        allowLateSubmissions: data.allowLateSubmissions,
        maxPoints: data.maxPoints,
        submissionMode: data.submissionMode,
        classSubjectId,
      },
      include: {
        classSubject: { include: { subject: true } },
        _count: { select: { submissions: true } },
      },
    });

    return this.formatActivityResponse(activity);
  }

  /**
   * Lista atividades de uma matéria na turma
   * Professor vê todas; alunos veem apenas publicadas
   */
  async listActivities(
    userId: number,
    userRoles: string[],
    classSubjectId: number,
    query: ListActivitiesQuery
  ): Promise<{ data: ActivityResponse[]; pagination: any }> {
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { classGroup: { select: { teacherId: true, id: true } } },
    });

    if (!classSubject) throw new NotFoundError("Matéria da turma", classSubjectId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classSubject.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: classSubject.classGroupId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso às atividades desta matéria");
    }

    const { page, limit, sortBy, sortOrder, status, search } = query;

    const where: any = { classSubjectId };

    // Alunos veem apenas publicadas (exceto professor/admin)
    if (!isAdmin && !isOwner) {
      where.isPublished = true;
    } else if (status !== "all") {
      where.isPublished = status === "published";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          classSubject: { include: { subject: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { [sortBy ?? "createdAt"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return {
      data: activities.map(this.formatActivityResponse),
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
   * Busca detalhes de uma atividade
   */
  async getActivity(
    userId: number,
    userRoles: string[],
    activityId: number
  ): Promise<ActivityResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        classSubject: {
          include: {
            subject: true,
            classGroup: { select: { id: true, teacherId: true } },
          },
        },
        _count: { select: { submissions: true } },
      },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = activity.classSubject.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: activity.classSubject.classGroupId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso a esta atividade");
    }

    // Aluno não vê atividades não publicadas
    if (!activity.isPublished && !isAdmin && !isOwner) {
      throw new NotFoundError("Atividade", activityId);
    }

    return this.formatActivityResponse(activity);
  }

  /**
   * Atualiza atividade
   * Professor dono ou ADMIN
   */
  async updateActivity(
    userId: number,
    userRoles: string[],
    activityId: number,
    data: UpdateActivityInput
  ): Promise<ActivityResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classSubject: { include: { classGroup: { select: { teacherId: true } } } } },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = activity.classSubject.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor que criou pode atualizar esta atividade");
    }

    // Se já publicada e professor tenta alterar submissionMode, bloqueia se houver entregas
    if (activity.isPublished && data.submissionMode && data.submissionMode !== activity.submissionMode) {
      const submissionsCount = await prisma.submission.count({ where: { activityId } });
      if (submissionsCount > 0) {
        throw new ConflictError("Não é possível alterar modo de entrega após existirem entregas");
      }
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: updateData,
      include: {
        classSubject: { include: { subject: true } },
        _count: { select: { submissions: true } },
      },
    });

    return this.formatActivityResponse(updated);
  }

  /**
   * Publica/Despublica atividade
   * Professor dono ou ADMIN
   */
  async togglePublishActivity(
    userId: number,
    userRoles: string[],
    activityId: number,
    publish: boolean
  ): Promise<ActivityResponse> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classSubject: { include: { classGroup: { select: { teacherId: true } } } } },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = activity.classSubject.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode publicar/despublicar");
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: { isPublished: publish },
      include: {
        classSubject: { include: { subject: true } },
        _count: { select: { submissions: true } },
      },
    });

    return this.formatActivityResponse(updated);
  }

  /**
   * Exclui atividade
   * Professor dono ou ADMIN
   */
  async deleteActivity(userId: number, userRoles: string[], activityId: number): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { classSubject: { include: { classGroup: { select: { teacherId: true } } } } },
    });

    if (!activity) throw new NotFoundError("Atividade", activityId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = activity.classSubject.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor que criou pode excluir esta atividade");
    }

    await prisma.activity.delete({ where: { id: activityId } });
  }

  private formatActivityResponse(activity: any): ActivityResponse {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      classSubjectId: activity.classSubjectId,
      classSubjectName: activity.classSubject?.subject?.name ?? "Desconhecida",
      dueAt: activity.dueAt,
      allowLateSubmissions: activity.allowLateSubmissions,
      maxPoints: Number(activity.maxPoints),
      submissionMode: activity.submissionMode,
      isPublished: activity.isPublished,
      createdAt: activity.createdAt,
      _count: activity._count,
    };
  }
}

export const activityService = new ActivityService();