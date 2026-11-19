import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../lib/errors";
import type {
  CreateClassInput,
  UpdateClassInput,
  EnrollStudentInput,
  ListClassesQuery,
  ClassResponse,
  ClassDetailResponse,
} from "../lib/validators/class";
import { RoleCode, EnrollmentStatus } from "../../generated/prisma/enums";

export class ClassService {
  /**
   * Cria uma nova turma
   * - ADMIN pode criar e definir teacherId
   * - TEACHER cria para si mesmo (teacherId = seu userId)
   */
  async createClass(userId: number, userRoles: string[], data: CreateClassInput): Promise<ClassResponse> {
    // Verifica permissão: ADMIN ou TEACHER
    const isAdmin = userRoles.includes("ADMIN");
    const isTeacher = userRoles.includes("TEACHER");

    if (!isAdmin && !isTeacher) {
      throw new ForbiddenError("Apenas professores e administradores podem criar turmas");
    }

    // Determina teacherId
    let teacherId: number | null = null;
    if (isAdmin && data.teacherId) {
      // ADMIN pode atribuir a outro professor
      const teacher = await prisma.user.findUnique({
        where: { id: data.teacherId },
        include: { userRoles: { include: { role: true } } },
      });
      if (!teacher) throw new NotFoundError("Professor", data.teacherId);
      const isTeacherRole = teacher.userRoles.some((ur) => ur.role.code === RoleCode.TEACHER);
      if (!isTeacherRole) throw new ValidationError("Usuário informado não possui role de professor");
      teacherId = data.teacherId;
    } else if (isTeacher) {
      // TEACHER cria para si mesmo
      teacherId = userId;
    }

    // Verifica se código já existe
    const existingCode = await prisma.classGroup.findUnique({ where: { code: data.code } });
    if (existingCode) throw new ConflictError("Código de turma já cadastrado");

    const classGroup = await prisma.classGroup.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        capacity: data.capacity ?? null,
        teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: {
          select: { enrolledIn: true, classSubjects: true, learningContents: true, sessions: true },
        },
      },
    });

    return this.formatClassResponse(classGroup);
  }

  /**
   * Lista turmas com filtros e paginação
   * - ADMIN vê todas
   * - TEACHER vê suas turmas (onde é professor)
   * - STUDENT vê turmas onde está matriculado (ACTIVE)
   */
  async listClasses(
    userId: number,
    userRoles: string[],
    query: ListClassesQuery
  ): Promise<{ data: ClassResponse[]; pagination: any }> {
    const { page, limit, sortBy, sortOrder, teacherId, studentId, search } = query;
    const isAdmin = userRoles.includes("ADMIN");
    const isTeacher = userRoles.includes("TEACHER");

    const where: any = {};

    // Filtro por professor
    if (teacherId) {
      if (!isAdmin && teacherId !== userId) {
        throw new ForbiddenError("Você só pode ver suas próprias turmas");
      }
      where.teacherId = teacherId;
    } else if (isTeacher && !isAdmin) {
      // TEACHER não admin vê apenas suas turmas
      where.teacherId = userId;
    }
    // ADMIN sem teacherId vê todas

    // Filtro por aluno matriculado
    if (studentId) {
      if (!isAdmin && studentId !== userId) {
        throw new ForbiddenError("Você só pode ver suas próprias matrículas");
      }
      where.enrolledIn = { some: { userId: studentId, status: EnrollmentStatus.ACTIVE } };
    }

    // Busca textual
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [classes, total] = await Promise.all([
      prisma.classGroup.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          _count: {
            select: { enrolledIn: true, classSubjects: true, learningContents: true, sessions: true },
          },
        },
        orderBy: { [sortBy ?? "createdAt"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.classGroup.count({ where }),
    ]);

    return {
      data: classes.map(this.formatClassResponse),
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
   * Busca detalhes de uma turma
   * - ADMIN: qualquer turma
   * - TEACHER: apenas suas turmas
   * - STUDENT: apenas se matriculado (ACTIVE)
   */
  async getClass(userId: number, userRoles: string[], classId: number): Promise<ClassDetailResponse> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        enrolledIn: {
          where: { status: EnrollmentStatus.ACTIVE },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        classSubjects: {
          include: { subject: true },
        },
        _count: {
          select: { enrolledIn: true, classSubjects: true, learningContents: true, sessions: true },
        },
      },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    // Verifica permissão de acesso
    const isAdmin = userRoles.includes("ADMIN");
    const isTeacher = classGroup.teacherId === userId;
    const isEnrolled = classGroup.enrolledIn.some((e) => e.userId === userId);

    if (!isAdmin && !isTeacher && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso a esta turma");
    }

    return {
      ...this.formatClassResponse(classGroup),
      teacher: classGroup.teacher,
      enrollments: classGroup.enrolledIn.map((e) => ({
        id: e.id,
        userId: e.user.id,
        userName: e.user.name,
        userEmail: e.user.email,
        status: e.status,
        createdAt: e.createdAt,
      })),
      subjects: classGroup.classSubjects.map((cs) => ({
        id: cs.id,
        code: cs.subject.code,
        name: cs.subject.name,
        description: cs.subject.description,
      })),
    };
  }

  /**
   * Atualiza uma turma
   * - ADMIN: pode alterar tudo, inclusive teacherId
   * - TEACHER (dono): pode alterar name, description, capacity
   */
  async updateClass(
    userId: number,
    userRoles: string[],
    classId: number,
    data: UpdateClassInput
  ): Promise<ClassResponse> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para atualizar esta turma");
    }

    // TEACHER não admin não pode alterar teacherId
    const updateData: any = { ...data };
    if (!isAdmin) {
      delete updateData.teacherId;
    } else if (updateData.teacherId !== undefined) {
      // ADMIN alterando professor: valida se é TEACHER
      if (updateData.teacherId !== null) {
        const teacher = await prisma.user.findUnique({
          where: { id: updateData.teacherId },
          include: { userRoles: { include: { role: true } } },
        });
        if (!teacher) throw new NotFoundError("Professor", updateData.teacherId);
        const isTeacherRole = teacher.userRoles.some((ur) => ur.role.code === RoleCode.TEACHER);
        if (!isTeacherRole) throw new ValidationError("Usuário informado não possui role de professor");
      }
    }

    const updated = await prisma.classGroup.update({
      where: { id: classId },
      data: updateData,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: {
          select: { enrolledIn: true, classSubjects: true, learningContents: true, sessions: true },
        },
      },
    });

    return this.formatClassResponse(updated);
  }

  /**
   * Exclui uma turma (soft delete não implementado - hard delete)
   * - Apenas ADMIN ou professor dono
   * - Remove matrículas, conteúdos, sessões, etc. (cascade no Prisma)
   */
  async deleteClass(userId: number, userRoles: string[], classId: number): Promise<void> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Você não tem permissão para excluir esta turma");
    }

    await prisma.classGroup.delete({ where: { id: classId } });
  }

  /**
   * Matricula um aluno na turma
   * - ADMIN ou professor da turma
   * - Verifica se aluno existe e tem role STUDENT
   * - Verifica capacidade da turma
   */
  async enrollStudent(
    userId: number,
    userRoles: string[],
    classId: number,
    data: EnrollStudentInput
  ): Promise<{ enrollmentId: number; message: string }> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true, capacity: true, _count: { select: { enrolledIn: true } } },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma ou administrador pode matricular alunos");
    }

    // Verifica se aluno existe e é STUDENT
    const student = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!student) throw new NotFoundError("Aluno", data.userId);
    const isStudent = student.userRoles.some((ur) => ur.role.code === RoleCode.STUDENT);
    if (!isStudent) throw new ValidationError("Usuário informado não possui role de estudante");

    // Verifica se já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_classId: { userId: data.userId, classId } },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictError("Aluno já está matriculado nesta turma");
      }
      // Reativa matrícula existente
      await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: { status: EnrollmentStatus.ACTIVE, activatedAt: new Date() },
      });
      return { enrollmentId: existingEnrollment.id, message: "Matrícula reativada com sucesso" };
    }

    // Verifica capacidade
    if (classGroup.capacity && classGroup._count.enrolledIn >= classGroup.capacity) {
      throw new ConflictError("Turma atingiu a capacidade máxima");
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: data.userId,
        classId,
        status: EnrollmentStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });

    return { enrollmentId: enrollment.id, message: "Aluno matriculado com sucesso" };
  }

  /**
   * Remove matrícula (cancela)
   * - ADMIN ou professor da turma
   * - Aluno pode cancelar própria matrícula
   */
  async removeEnrollment(
    userId: number,
    userRoles: string[],
    classId: number,
    enrollmentId: number
  ): Promise<void> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!enrollment) throw new NotFoundError("Matrícula", enrollmentId);
    if (enrollment.classId !== classId) throw new ValidationError("Matrícula não pertence a esta turma");

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = enrollment.classGroup.teacherId === userId;
    const isStudent = enrollment.userId === userId;

    if (!isAdmin && !isOwner && !isStudent) {
      throw new ForbiddenError("Você não tem permissão para remover esta matrícula");
    }

    // Professor/ADMIN cancela; aluno sai (CANCELLED)
    const newStatus = isStudent ? EnrollmentStatus.CANCELLED : EnrollmentStatus.CANCELLED;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: newStatus },
    });
  }

  /**
   * Lista alunos matriculados na turma
   * - ADMIN, professor da turma, ou alunos matriculados
   */
  async listStudents(
    userId: number,
    userRoles: string[],
    classId: number,
    query: ListClassesQuery
  ): Promise<{ data: any[]; pagination: any }> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId, userId, status: EnrollmentStatus.ACTIVE },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso à lista de alunos desta turma");
    }

    const { page, limit, sortBy, sortOrder, search } = query;

    const where: any = { classId, status: EnrollmentStatus.ACTIVE };

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, phone: true, education: true } } },
        orderBy: { [sortBy ?? "createdAt"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments.map((e) => ({
        id: e.id,
        userId: e.user.id,
        userName: e.user.name,
        userEmail: e.user.email,
        userPhone: e.user.phone,
        userEducation: e.user.education,
        status: e.status,
        enrolledAt: e.createdAt,
        activatedAt: e.activatedAt,
      })),
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
   * Lista matérias da turma
   */
  async listClassSubjects(userId: number, userRoles: string[], classId: number): Promise<any[]> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId, userId, status: EnrollmentStatus.ACTIVE },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso às matérias desta turma");
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { classGroupId: classId },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } },
    });

    return classSubjects.map((cs) => ({
      id: cs.id,
      classSubjectId: cs.id,
      subjectId: cs.subject.id,
      code: cs.subject.code,
      name: cs.subject.name,
      description: cs.subject.description,
      createdAt: cs.createdAt,
    }));
  }

  /**
   * Formata resposta padronizada de turma
   */
  private formatClassResponse(classGroup: any): ClassResponse {
    return {
      id: classGroup.id,
      name: classGroup.name,
      code: classGroup.code,
      description: classGroup.description,
      capacity: classGroup.capacity,
      teacherId: classGroup.teacherId,
      teacherName: classGroup.teacher?.name ?? null,
      createdAt: classGroup.createdAt,
      _count: classGroup._count,
    };
  }
}

export const classService = new ClassService();