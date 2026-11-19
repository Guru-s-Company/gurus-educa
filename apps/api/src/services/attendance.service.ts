import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from "../lib/errors";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  RecordAttendanceInput,
  RecordBulkAttendanceInput,
  ListSessionsQuery,
  SessionResponse,
  SessionDetailResponse,
  MyAttendanceResponse,
} from "../lib/validators/attendance";

export class AttendanceService {
  /**
   * Cria sessão/encontro (professor da turma)
   */
  async createSession(
    userId: number,
    userRoles: string[],
    classId: number,
    data: CreateSessionInput
  ): Promise<SessionResponse> {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });

    if (!classGroup) throw new NotFoundError("Turma", classId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode criar sessões");
    }

    // Valida classSubjectId se informado
    if (data.classSubjectId) {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: data.classSubjectId },
        select: { classGroupId: true },
      });
      if (!classSubject || classSubject.classGroupId !== classId) {
        throw new ValidationError("Matéria não pertence a esta turma");
      }
    }

    const session = await prisma.classSession.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        meetingUrl: data.meetingUrl ?? null,
        classGroupId: classId,
        classSubjectId: data.classSubjectId ?? null,
      },
      include: {
        classSubject: { include: { subject: true } },
        _count: { select: { attendances: true } },
      },
    });

    return this.formatSessionResponse(session);
  }

  /**
   * Lista sessões da turma
   */
  async listSessions(
    userId: number,
    userRoles: string[],
    classId: number,
    query: ListSessionsQuery
  ): Promise<{ data: SessionResponse[]; pagination: any }> {
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
      throw new ForbiddenError("Você não tem acesso às sessões desta turma");
    }

    const { page, limit, sortBy, sortOrder, status, classSubjectId, dateFrom, dateTo } = query;

    const where: any = { classGroupId: classId };
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (status !== "all") where.status = status;
    if (dateFrom || dateTo) {
      where.scheduledStart = {};
      if (dateFrom) where.scheduledStart.gte = dateFrom;
      if (dateTo) where.scheduledStart.lte = dateTo;
    }

    const [sessions, total] = await Promise.all([
      prisma.classSession.findMany({
        where,
        include: {
          classSubject: { include: { subject: true } },
          _count: { select: { attendances: true } },
        },
        orderBy: { [sortBy ?? "scheduledStart"]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.classSession.count({ where }),
    ]);

    return {
      data: sessions.map(this.formatSessionResponse),
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
   * Busca detalhes de uma sessão com presenças
   */
  async getSession(
    userId: number,
    userRoles: string[],
    sessionId: number
  ): Promise<SessionDetailResponse> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        classGroup: { select: { id: true, teacherId: true } },
        classSubject: { include: { subject: true } },
        attendances: {
          include: { enrollment: { include: { user: { select: { id: true, name: true, email: true } } } } },
        },
        _count: { select: { attendances: true } },
      },
    });

    if (!session) throw new NotFoundError("Sessão", sessionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = session.classGroup.teacherId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { classId: session.classGroupId, userId, status: "ACTIVE" },
    });

    if (!isAdmin && !isOwner && !isEnrolled) {
      throw new ForbiddenError("Você não tem acesso a esta sessão");
    }

    return {
      ...this.formatSessionResponse(session),
      attendances: session.attendances.map((a) => ({
        id: a.id,
        enrollmentId: a.enrollmentId,
        studentId: a.enrollment.user.id,
        studentName: a.enrollment.user.name,
        studentEmail: a.enrollment.user.email,
        status: a.status,
        note: a.note,
        recordedAt: a.recordedAt,
      })),
    };
  }

  /**
   * Atualiza sessão (professor dono/ADMIN)
   */
  async updateSession(
    userId: number,
    userRoles: string[],
    sessionId: number,
    data: UpdateSessionInput
  ): Promise<SessionResponse> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!session) throw new NotFoundError("Sessão", sessionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = session.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode atualizar esta sessão");
    }

    // Valida classSubjectId se informado
    if (data.classSubjectId !== undefined && data.classSubjectId !== null) {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: data.classSubjectId },
        select: { classGroupId: true },
      });
      if (!classSubject || classSubject.classGroupId !== session.classGroupId) {
        throw new ValidationError("Matéria não pertence a esta turma");
      }
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const updated = await prisma.classSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        classSubject: { include: { subject: true } },
        _count: { select: { attendances: true } },
      },
    });

    return this.formatSessionResponse(updated);
  }

  /**
   * Exclui sessão (professor dono/ADMIN)
   */
  async deleteSession(userId: number, userRoles: string[], sessionId: number): Promise<void> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classGroup: { select: { teacherId: true } } },
    });

    if (!session) throw new NotFoundError("Sessão", sessionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = session.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode excluir esta sessão");
    }

    await prisma.classSession.delete({ where: { id: sessionId } });
  }

  /**
   * Registra presença individual (professor)
   */
  async recordAttendance(
    userId: number,
    userRoles: string[],
    sessionId: number,
    data: RecordAttendanceInput
  ): Promise<{ attendanceId: number; message: string }> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classGroup: { select: { id: true, teacherId: true } } },
    });

    if (!session) throw new NotFoundError("Sessão", sessionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = session.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode registrar presença");
    }

    // Verifica se matrícula pertence à turma e está ativa
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: data.enrollmentId, classId: session.classGroupId, status: "ACTIVE" },
    });

    if (!enrollment) throw new NotFoundError("Matrícula não encontrada nesta turma", data.enrollmentId);

    // Verifica se já existe registro
    const existing = await prisma.attendance.findUnique({
      where: { enrollmentId_sessionId: { enrollmentId: data.enrollmentId, sessionId } },
    });

    if (existing) {
      // Atualiza registro existente
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: data.status, note: data.note ?? null },
      });
      return { attendanceId: existing.id, message: "Presença atualizada" };
    }

    const attendance = await prisma.attendance.create({
      data: {
        enrollmentId: data.enrollmentId,
        sessionId,
        status: data.status,
        note: data.note ?? null,
      },
    });

    return { attendanceId: attendance.id, message: "Presença registrada" };
  }

  /**
   * Registra presença em lote (professor)
   */
  async recordBulkAttendance(
    userId: number,
    userRoles: string[],
    sessionId: number,
    data: RecordBulkAttendanceInput
  ): Promise<{ created: number; updated: number }> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classGroup: { select: { id: true, teacherId: true } } },
    });

    if (!session) throw new NotFoundError("Sessão", sessionId);

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = session.classGroup.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("Apenas o professor da turma pode registrar presença");
    }

    let created = 0;
    let updated = 0;

    await prisma.$transaction(async (tx) => {
      for (const record of data.records) {
        const enrollment = await tx.enrollment.findFirst({
          where: { id: record.enrollmentId, classId: session.classGroupId, status: "ACTIVE" },
        });

        if (!enrollment) continue; // Pula matrículas inválidas

        const existing = await tx.attendance.findUnique({
          where: { enrollmentId_sessionId: { enrollmentId: record.enrollmentId, sessionId } },
        });

        if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: { status: record.status, note: record.note ?? null },
          });
          updated++;
        } else {
          await tx.attendance.create({
            data: {
              enrollmentId: record.enrollmentId,
              sessionId,
              status: record.status,
              note: record.note ?? null,
            },
          });
          created++;
        }
      }
    });

    return { created, updated };
  }

  /**
   * Lista presenças de uma sessão (professor/aluno da turma)
   */
  async getSessionAttendance(
    userId: number,
    userRoles: string[],
    sessionId: number
  ): Promise<SessionDetailResponse> {
    return this.getSession(userId, userRoles, sessionId);
  }

  /**
   * Minha presença (aluno) - lista todas as sessões da turma com meu status
   */
  async getMyAttendance(
    userId: number,
    classId: number
  ): Promise<{ data: MyAttendanceResponse[]; pagination: any }> {
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, classId, status: "ACTIVE" },
    });

    if (!enrollment) throw new ForbiddenError("Você não está matriculado nesta turma");

    const sessions = await prisma.classSession.findMany({
      where: { classGroupId: classId },
      include: {
        attendances: {
          where: { enrollmentId: enrollment.id },
          select: { status: true, recordedAt: true, note: true },
        },
        classSubject: { include: { subject: true } },
      },
      orderBy: { scheduledStart: "asc" },
    });

    return {
      data: sessions.map((s) => ({
        sessionId: s.id,
        sessionTitle: s.title,
        scheduledStart: s.scheduledStart,
        scheduledEnd: s.scheduledEnd,
        status: s.attendances[0]?.status ?? "NOT_RECORDED",
        recordedAt: s.attendances[0]?.recordedAt ?? null,
        note: s.attendances[0]?.note ?? null,
      })),
      pagination: { page: 1, limit: sessions.length, total: sessions.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  }

  private formatSessionResponse(session: any): SessionResponse {
    return {
      id: session.id,
      classGroupId: session.classGroupId,
      classSubjectId: session.classSubjectId,
      classSubjectName: session.classSubject?.subject?.name ?? null,
      title: session.title,
      description: session.description,
      scheduledStart: session.scheduledStart,
      scheduledEnd: session.scheduledEnd,
      meetingUrl: session.meetingUrl,
      status: session.status,
      createdAt: session.createdAt,
      _count: session._count,
    };
  }
}

export const attendanceService = new AttendanceService();