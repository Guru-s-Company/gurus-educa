import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../lib/errors";
import type {
  CreateSubjectInput,
  ListSubjectsQuery,
  AddSubjectToClassInput,
  SubjectResponse,
  ClassSubjectResponse,
} from "../lib/validators/subject";
import { RoleCode } from "../../generated/prisma/enums";

export class SubjectService {
  /**
   * Cria matéria no catálogo global (apenas ADMIN)
   */
  async createSubject(userRoles: string[], data: CreateSubjectInput): Promise<SubjectResponse> {
    if (!userRoles.includes("ADMIN")) {
      throw new ForbiddenError("Apenas administradores podem criar matérias no catálogo");
    }

    const existing = await prisma.subject.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError("Código de matéria já cadastrado");

    const subject = await prisma.subject.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
      },
      include: { _count: { select: { classSubjects: true } } },
    });

    return this.formatSubjectResponse(subject);
  }

  /**
   * Lista matérias do catálogo (público para usuários autenticados)
   */
  async listSubjects(query: ListSubjectsQuery): Promise<{ data: SubjectResponse[]; pagination: any }> {
    const { page, limit, sortBy, sortOrder, search } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: { _count: { select: { classSubjects: true } } },
        orderBy: { [sortBy ?? "name"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subject.count({ where }),
    ]);

    return {
      data: subjects.map(this.formatSubjectResponse),
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
   * Adiciona matéria a uma turma (professor da turma ou ADMIN)
   */
  async addSubjectToClass(
    userId: number,
    userRoles: string[],
    classId: number,
    data: AddSubjectToClassInput
  ): Promise<ClassSubjectResponse> {
    // Verifica se turma existe e permissões
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma ou administrador pode adicionar matérias");
    }

    // Verifica se matéria existe
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) throw new NotFoundError("Matéria", data.subjectId);

    // Verifica se já está na turma
    const existing = await prisma.classSubject.findUnique({
      where: { classGroupId_subjectId: { classGroupId: classId, subjectId: data.subjectId } },
    });

    if (existing) throw new ConflictError("Esta matéria já está associada à turma");

    const classSubject = await prisma.classSubject.create({
      data: {
        classGroupId: classId,
        subjectId: data.subjectId,
      },
      include: { subject: true },
    });

    return this.formatClassSubjectResponse(classSubject);
  }

  /**
   * Remove matéria de uma turma (professor da turma ou ADMIN)
   */
  async removeSubjectFromClass(
    userId: number,
    userRoles: string[],
    classId: number,
    subjectId: number
  ): Promise<void> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma ou administrador pode remover matérias");
    }

    const classSubject = await prisma.classSubject.findUnique({
      where: { classGroupId_subjectId: { classGroupId: classId, subjectId } },
    });

    if (!classSubject) throw new NotFoundError("Associação turma-matéria", `${classId}-${subjectId}`);

    // Verifica se há conteúdos ou atividades vinculados
    const [contentsCount, activitiesCount] = await Promise.all([
      prisma.learningContent.count({ where: { classSubjectId: classSubject.id } }),
      prisma.activity.count({ where: { classSubjectId: classSubject.id } }),
    ]);

    if (contentsCount > 0 || activitiesCount > 0) {
      throw new ConflictError(
        "Não é possível remover: existem conteúdos ou atividades vinculados a esta matéria na turma"
      );
    }

    await prisma.classSubject.delete({
      where: { id: classSubject.id },
    });
  }

  /**
   * Lista matérias de uma turma
   */
  async listClassSubjects(userId: number, userRoles: string[], classId: number): Promise<ClassSubjectResponse[]> {
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
      throw new ForbiddenError("Você não tem acesso às matérias desta turma");
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { classGroupId: classId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } },
    });

    return classSubjects.map(this.formatClassSubjectResponse);
  }

  private formatSubjectResponse(subject: any): SubjectResponse {
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      createdAt: subject.createdAt,
      _count: subject._count,
    };
  }

  private formatClassSubjectResponse(classSubject: any): ClassSubjectResponse {
    return {
      id: classSubject.id,
      classGroupId: classSubject.classGroupId,
      subjectId: classSubject.subjectId,
      subject: this.formatSubjectResponse(classSubject.subject),
      createdAt: classSubject.createdAt,
    };
  }
}

export const subjectService = new SubjectService();