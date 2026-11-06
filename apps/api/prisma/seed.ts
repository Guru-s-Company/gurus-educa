// Arquivo para dados iniciais do banco.
import { prisma } from "../src/lib/prisma";

// Importação dos enums para uso.
import {
  RoleCode,
  EnrollmentStatus,
  SessionStatus,
  AttendanceStatus,
  SubmissionMode,
  OrganizationVisibility,
  OrganizationJoinPolicy,
  OrganizationMemberStatus,
  OrganizationPermissionCode,
  ChannelPermissionCode,
  OrganizationJoinRequestStatus,
  ProjectVisibility,
  ProjectMemberStatus,
  ProjectPermissionCode,
  ProjectContributionStatus,
  WorkItemStatus,
} from "../generated/prisma/enums";

import { createHash, randomBytes, scrypt } from "node:crypto";

import type { Prisma } from "../generated/prisma/client";

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
}

// Criação de types e Seeds para usar o satisfies.

type UsuarioSeed = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  createdAt: Date;
  isActive: boolean;
  roles: RoleCode[];
};

type TurmaSeed = {
  code: string;
  name: string;
  description: string;
  teacherEmail: string;
  subjectCodes: string[];
};

type MatriculaSeed = {
  userEmail: string;
  classCode: string;
  status: EnrollmentStatus;
};

type ConteudoSeed = {
  title: string;
  body: string;
  classCode: string;
  subjectCode?: string;
  authorEmail: string;
  attachment?: {
    fileName: string;
    url: string;
    mimeType: string;
  };
};

type AulaSeed = {
  title: string;
  description: string;
  classCode: string;
  subjectCode?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  meetingUrl: string;
  status: SessionStatus;
};

type AtividadeSeed = {
  title: string;
  description: string;
  classCode: string;
  subjectCode: string;
  dueAt: Date;
  submissionMode: SubmissionMode;
  maxPoints: number;
  allowLateSubmissions: boolean;
};

type EntregaSeed = {
  activityTitle: string;
  classCode: string;
  subjectCode: string;
  textAnswer: string;
  grade: number;
  feedback: string;
  studentEmails: string[];
  attachment?: {
    fileName: string;
    url: string;
    mimeType: string;
  };
};

type PresencaSeed = {
  studentEmail: string;
  classCode: string;
  sessionTitle: string;
  sessionStartsAt: Date;
  status: AttendanceStatus;
  note?: string;
};

// População básica de dados.

const roles = [
  {
    code: RoleCode.STUDENT,
    description: "Estudante",
    canManageUsers: false,
    canCreateClassGroups: false,
    canCreateActivities: false,
  },
  {
    code: RoleCode.TEACHER,
    description: "Professor",
    canManageUsers: false,
    canCreateClassGroups: true,
    canCreateActivities: true,
  },
  {
    code: RoleCode.ADMIN,
    description: "Administração",
    canManageUsers: true,
    canCreateClassGroups: true,
    canCreateActivities: true,
  },
] satisfies Prisma.RoleCreateInput[];

const usuarios = [
  {
    name: "Matheus Souza",
    email: "matheus.sbs03@gmail.com",
    cpf: "49219234858",
    phone: "11972762077",
    password: "SenhaSuperReal",
    isActive: true,
    createdAt: new Date("2026-11-02"),
    roles: [RoleCode.STUDENT],
  },
  {
    name: "Kauã Mariano",
    email: "kaua.mariano@example.com",
    cpf: "22222222222",
    phone: "11900000002",
    password: "HASH_DE_TESTE_SUBSTITUIR",
    isActive: true,
    createdAt: new Date("2026-01-12"),
    roles: [RoleCode.STUDENT],
  },
  {
    name: "Ignácio Cunha",
    email: "ig@professor.senai.br",
    cpf: "12345678901",
    phone: "11400289222",
    password: "SenhaDoSenaiGuardadaASeteChaves",
    isActive: true,
    createdAt: new Date("2025-10-01"),
    roles: [RoleCode.TEACHER],
  },
  {
    name: "Marcos Salsicha Alves",
    email: "chefao.senai@gmail.com",
    cpf: "98765432101",
    phone: "11999999999",
    password: "SenhaDoMundo",
    isActive: true,
    createdAt: new Date("2026-09-11"),
    roles: [RoleCode.TEACHER, RoleCode.ADMIN],
  },
  {
    name: "Beatriz Lima",
    email: "beatriz.teste@example.com",
    cpf: "33333333333",
    phone: "11900000003",
    password: "HASH_DE_TESTE_SUBSTITUIR",
    isActive: true,
    createdAt: new Date("2026-11-03"),
    roles: [RoleCode.STUDENT],
  },
] satisfies UsuarioSeed[];

const materias = [
  {
    code: "JS_BASIC",
    name: "JavaScript Básico",
    description: "Fundamentos da linguagem JavaScript.",
  },
  {
    code: "DB_SQL",
    name: "Banco de Dados SQL",
    description: "Modelagem e consultas em bancos relacionais.",
  },
  {
    code: "WEB_HTML",
    name: "Desenvolvimento Web",
    description: "Fundamentos de HTML e desenvolvimento web.",
  },
] satisfies Prisma.SubjectCreateInput[];

const turmas = [
  {
    name: "Análise e Desenvolvimento de Sistemas - 2026",
    code: "2IH-DS",
    description: "A melhor sala do ano, disparado!",
    teacherEmail: "ig@professor.senai.br",
    subjectCodes: ["JS_BASIC", "DB_SQL"],
  },
  {
    name: "Análise e Desenvolvimento de Sistemas - 2026",
    code: "2IE-DS",
    description: "A sala do Sr. Paulo e Mr. Raul.",
    teacherEmail: "ig@professor.senai.br",
    subjectCodes: ["DB_SQL", "WEB_HTML"],
  },
  {
    name: "Análise e Desenvolvimento de Sistemas - 2025",
    code: "2IH-67",
    description: "A sala do falecido Sr. Giba.",
    teacherEmail: "chefao.senai@gmail.com",
    subjectCodes: ["WEB_HTML"],
  },
] satisfies TurmaSeed[];

const matriculas = [
  {
    userEmail: "matheus.sbs03@gmail.com",
    classCode: "2IH-DS",
    status: EnrollmentStatus.ACTIVE,
  },
  {
    userEmail: "kaua.mariano@example.com",
    classCode: "2IH-DS",
    status: EnrollmentStatus.ACTIVE,
  },
  {
    userEmail: "kaua.mariano@example.com",
    classCode: "2IH-67",
    status: EnrollmentStatus.COMPLETED,
  },
  {
    userEmail: "matheus.sbs03@gmail.com",
    classCode: "2IE-DS",
    status: EnrollmentStatus.WAITLIST,
  },
] satisfies MatriculaSeed[];

const conteudos = [
  {
    title: "Boas-vindas à turma",
    body: "Conteúdo geral da turma, sem vínculo obrigatório com uma matéria.",
    classCode: "2IH-DS",
    authorEmail: "ig@professor.senai.br",
    attachment: {
      fileName: "boas-vindas.pdf",
      url: "https://example.com/arquivos/boas-vindas.pdf",
      mimeType: "application/pdf",
    },
  },
  {
    title: "Introdução ao JavaScript",
    body: "Variáveis, tipos, operadores e estruturas de controle.",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    authorEmail: "ig@professor.senai.br",
    attachment: {
      fileName: "introducao-js.pdf",
      url: "https://example.com/arquivos/introducao-js.pdf",
      mimeType: "application/pdf",
    },
  },
] satisfies ConteudoSeed[];

const aulas = [
  {
    title: "Encontro de apresentação",
    description: "Aula geral de apresentação da turma.",
    classCode: "2IH-DS",
    scheduledStart: new Date("2026-11-03T19:00:00-03:00"),
    scheduledEnd: new Date("2026-11-03T20:00:00-03:00"),
    meetingUrl: "https://example.com/reuniao/apresentacao",
    status: SessionStatus.SCHEDULED,
  },
  {
    title: "Aula de introdução ao JavaScript",
    description: "Aula concluída vinculada à matéria de JavaScript Básico.",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    scheduledStart: new Date("2026-10-20T19:00:00-03:00"),
    scheduledEnd: new Date("2026-10-20T20:30:00-03:00"),
    meetingUrl: "https://example.com/reuniao/javascript",
    status: SessionStatus.COMPLETED,
  },
  {
    title: "Aula de revisão",
    description: "Aula concluída para testar falta justificada.",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    scheduledStart: new Date("2026-10-21T19:00:00-03:00"),
    scheduledEnd: new Date("2026-10-21T20:00:00-03:00"),
    meetingUrl: "https://example.com/reuniao/revisao",
    status: SessionStatus.COMPLETED,
  },
  {
    title: "Aula remarcada de banco de dados",
    description: "Exemplo de aula que foi adiada.",
    classCode: "2IH-DS",
    subjectCode: "DB_SQL",
    scheduledStart: new Date("2026-11-05T19:00:00-03:00"),
    scheduledEnd: new Date("2026-11-05T20:30:00-03:00"),
    meetingUrl: "https://example.com/reuniao/banco-de-dados",
    status: SessionStatus.POSTPONED,
  },
] satisfies AulaSeed[];

const atividades = [
  {
    title: "Exercício individual de JavaScript",
    description: "Resolva os exercícios básicos de lógica e JavaScript.",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    dueAt: new Date("2026-11-10T23:59:00-03:00"),
    submissionMode: SubmissionMode.INDIVIDUAL,
    maxPoints: 100,
    allowLateSubmissions: false,
  },
  {
    title: "Projeto em grupo de JavaScript",
    description: "Desenvolvam juntos uma pequena aplicação JavaScript.",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    dueAt: new Date("2026-11-15T23:59:00-03:00"),
    submissionMode: SubmissionMode.GROUP,
    maxPoints: 100,
    allowLateSubmissions: true,
  },
] satisfies AtividadeSeed[];

const entregas = [
  {
    activityTitle: "Exercício individual de JavaScript",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    textAnswer: "[SEED: entrega individual] Respostas do exercício.",
    grade: 85,
    feedback: "Bom trabalho. Revise os casos de entrada inválida.",
    studentEmails: ["matheus.sbs03@gmail.com"],
    attachment: {
      fileName: "respostas-matheus.pdf",
      url: "https://example.com/entregas/respostas-matheus.pdf",
      mimeType: "application/pdf",
    },
  },
  {
    activityTitle: "Projeto em grupo de JavaScript",
    classCode: "2IH-DS",
    subjectCode: "JS_BASIC",
    textAnswer: "[SEED: entrega em grupo] Link e descrição do projeto.",
    grade: 95,
    feedback: "Boa divisão de responsabilidades e solução bem organizada.",
    studentEmails: [
      "matheus.sbs03@gmail.com",
      "kaua.mariano@example.com",
    ],
    attachment: {
      fileName: "projeto-grupo.zip",
      url: "https://example.com/entregas/projeto-grupo.zip",
      mimeType: "application/zip",
    },
  },
] satisfies EntregaSeed[];

const presencas = [
  {
    studentEmail: "matheus.sbs03@gmail.com",
    classCode: "2IH-DS",
    sessionTitle: "Aula de introdução ao JavaScript",
    sessionStartsAt: new Date("2026-10-20T19:00:00-03:00"),
    status: AttendanceStatus.PRESENT,
    note: "Presença registrada pelo professor.",
  },
  {
    studentEmail: "kaua.mariano@example.com",
    classCode: "2IH-DS",
    sessionTitle: "Aula de introdução ao JavaScript",
    sessionStartsAt: new Date("2026-10-20T19:00:00-03:00"),
    status: AttendanceStatus.ABSENT,
    note: "Estudante não participou da aula.",
  },
  {
    studentEmail: "matheus.sbs03@gmail.com",
    classCode: "2IH-DS",
    sessionTitle: "Aula de revisão",
    sessionStartsAt: new Date("2026-10-21T19:00:00-03:00"),
    status: AttendanceStatus.JUSTIFIED_ABSENCE,
    note: "Exemplo de falta justificada.",
  },
] satisfies PresencaSeed[];

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

async function buscarMateria(code: string) {
  return prisma.subject.findUniqueOrThrow({ where: { code } });
}

async function buscarTurma(code: string) {
  return prisma.classGroup.findUniqueOrThrow({ where: { code } });
}

async function buscarMateriaDaTurma(classCode: string, subjectCode: string) {
  const turma = await buscarTurma(classCode);
  const materia = await buscarMateria(subjectCode);

  return prisma.classSubject.findUniqueOrThrow({
    where: {
      classGroupId_subjectId: {
        classGroupId: turma.id,
        subjectId: materia.id,
      },
    },
  });
}

async function buscarMatricula(userEmail: string, classCode: string) {
  const usuario = await prisma.user.findUniqueOrThrow({
    where: { email: userEmail },
  });
  const turma = await buscarTurma(classCode);

  return prisma.enrollment.findUniqueOrThrow({
    where: {
      userId_classId: {
        userId: usuario.id,
        classId: turma.id,
      },
    },
  });
}

// ============================================================
// EXECUÇÃO
// ============================================================

// ============================================================
// ORGANIZAÇÕES, COMUNICAÇÃO E PROJETOS
// ============================================================

async function seedOrganizacoesEProjetos() {
  console.log("Populando organizações e projetos...");

  const matheus = await prisma.user.findUniqueOrThrow({
    where: { email: "matheus.sbs03@gmail.com" },
  });
  const kaua = await prisma.user.findUniqueOrThrow({
    where: { email: "kaua.mariano@example.com" },
  });
  const ignacio = await prisma.user.findUniqueOrThrow({
    where: { email: "ig@professor.senai.br" },
  });
  const beatriz = await prisma.user.findUniqueOrThrow({
    where: { email: "beatriz.teste@example.com" },
  });
  const marcos = await prisma.user.findUniqueOrThrow({
    where: { email: "chefao.senai@gmail.com" },
  });

  const matriculaMatheus = await buscarMatricula(
    "matheus.sbs03@gmail.com",
    "2IH-DS",
  );

  // 12. Organizações: uma independente e outra associada a uma matrícula.
  const dadosOrganizacaoIndependente = {
    name: "DevLab - Projetos e Estudos",
    description:
      "Espaço independente para estudar, compartilhar ideias e desenvolver projetos em conjunto.",
    tags: ["javascript", "backend", "estudos", "projetos"],
    visibility: OrganizationVisibility.PUBLIC,
    joinPolicy: OrganizationJoinPolicy.APPROVAL,
    ownerId: matheus.id,
    createdById: matheus.id,
    contextEnrollmentId: null,
    deletedAt: null,
  };

  let devLab = await prisma.organization.findFirst({
    where: {
      name: dadosOrganizacaoIndependente.name,
      ownerId: matheus.id,
      contextEnrollmentId: null,
    },
  });

  devLab = devLab
    ? await prisma.organization.update({
        where: { id: devLab.id },
        data: dadosOrganizacaoIndependente,
      })
    : await prisma.organization.create({
        data: dadosOrganizacaoIndependente,
      });

  const dadosOrganizacaoAcademica = {
    name: "Grupo de Estudos 2IH-DS",
    description:
      "Organização de apoio e comunicação dos estudantes da turma 2IH-DS.",
    tags: ["2ih-ds", "javascript", "banco-de-dados"],
    visibility: OrganizationVisibility.PRIVATE,
    joinPolicy: OrganizationJoinPolicy.INVITE_ONLY,
    ownerId: matheus.id,
    createdById: matheus.id,
    contextEnrollmentId: matriculaMatheus.id,
    deletedAt: null,
  };

  let grupoEstudos = await prisma.organization.findFirst({
    where: {
      name: dadosOrganizacaoAcademica.name,
      ownerId: matheus.id,
      contextEnrollmentId: matriculaMatheus.id,
    },
  });

  grupoEstudos = grupoEstudos
    ? await prisma.organization.update({
        where: { id: grupoEstudos.id },
        data: dadosOrganizacaoAcademica,
      })
    : await prisma.organization.create({
        data: dadosOrganizacaoAcademica,
      });

  // 13. Cargos das organizações.
  async function prepararCargosOrganizacao(organizationId: number) {
    // Evita conflito com o índice parcial de apenas um cargo padrão.
    await prisma.organizationRole.updateMany({
      where: { organizationId, isDefault: true },
      data: { isDefault: false },
    });

    const proprietario = await prisma.organizationRole.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: "Proprietário",
        },
      },
      update: { description: "Responsável principal pela organização.", isDefault: false },
      create: {
        organizationId,
        name: "Proprietário",
        description: "Responsável principal pela organização.",
        isDefault: false,
      },
    });

    const administrador = await prisma.organizationRole.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: "Administrador",
        },
      },
      update: { description: "Gerencia membros, canais e projetos.", isDefault: false },
      create: {
        organizationId,
        name: "Administrador",
        description: "Gerencia membros, canais e projetos.",
        isDefault: false,
      },
    });

    const membro = await prisma.organizationRole.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: "Membro",
        },
      },
      update: { description: "Participante padrão da organização.", isDefault: true },
      create: {
        organizationId,
        name: "Membro",
        description: "Participante padrão da organização.",
        isDefault: true,
      },
    });

    const permissoes = Object.values(OrganizationPermissionCode);
    const permissoesPorCargo: Record<string, OrganizationPermissionCode[]> = {
      PROPRIETARIO: permissoes,
      ADMINISTRADOR: permissoes.filter(
        (permission) => permission !== OrganizationPermissionCode.MANAGE_ORGANIZATION,
      ),
      MEMBRO: [
        OrganizationPermissionCode.SEND_MESSAGES,
        OrganizationPermissionCode.ATTACH_FILES,
        OrganizationPermissionCode.CREATE_PROJECTS,
      ],
    };

    for (const [key, role] of [
      ["PROPRIETARIO", proprietario],
      ["ADMINISTRADOR", administrador],
      ["MEMBRO", membro],
    ] as const) {
      const permitidas = permissoesPorCargo[key] ?? [];

      for (const permission of permissoes) {
        await prisma.organizationRolePermission.upsert({
          where: { roleId_permission: { roleId: role.id, permission } },
          update: { allowed: permitidas.includes(permission) },
          create: {
            roleId: role.id,
            permission,
            allowed: permitidas.includes(permission),
          },
        });
      }
    }

    return { proprietario, administrador, membro };
  }

  const cargosDevLab = await prepararCargosOrganizacao(devLab.id);
  const cargosGrupo = await prepararCargosOrganizacao(grupoEstudos.id);

  // 14. Membros e permissões individuais.
  async function garantirMembroOrganizacao(
    organizationId: number,
    userId: number,
    roleId: number,
  ) {
    return prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId, userId } },
      update: {
        roleId,
        status: OrganizationMemberStatus.ACTIVE,
        leftAt: null,
        removedAt: null,
      },
      create: {
        organizationId,
        userId,
        roleId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
  }

  const devLabOwner = await garantirMembroOrganizacao(
    devLab.id,
    matheus.id,
    cargosDevLab.proprietario.id,
  );
  const devLabKaua = await garantirMembroOrganizacao(
    devLab.id,
    kaua.id,
    cargosDevLab.membro.id,
  );
  const devLabIgnacio = await garantirMembroOrganizacao(
    devLab.id,
    ignacio.id,
    cargosDevLab.administrador.id,
  );

  const grupoOwner = await garantirMembroOrganizacao(
    grupoEstudos.id,
    matheus.id,
    cargosGrupo.proprietario.id,
  );
  await garantirMembroOrganizacao(
    grupoEstudos.id,
    kaua.id,
    cargosGrupo.membro.id,
  );

  // Registro histórico: Marcos já participou do grupo, mas saiu.
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: grupoEstudos.id,
        userId: marcos.id,
      },
    },
    update: {
      roleId: cargosGrupo.membro.id,
      status: OrganizationMemberStatus.LEFT,
      leftAt: new Date("2026-11-04T18:00:00-03:00"),
      removedAt: null,
    },
    create: {
      organizationId: grupoEstudos.id,
      userId: marcos.id,
      roleId: cargosGrupo.membro.id,
      status: OrganizationMemberStatus.LEFT,
      joinedAt: new Date("2026-10-20T12:00:00-03:00"),
      leftAt: new Date("2026-11-04T18:00:00-03:00"),
    },
  });

  await prisma.organizationMemberPermission.upsert({
    where: {
      memberId_permission: {
        memberId: devLabKaua.id,
        permission: OrganizationPermissionCode.INVITE_MEMBERS,
      },
    },
    update: { allowed: true },
    create: {
      memberId: devLabKaua.id,
      permission: OrganizationPermissionCode.INVITE_MEMBERS,
      allowed: true,
    },
  });

  // 15. Convite compartilhável e solicitação pendente de entrada.
  const tokenConviteTeste = "devlab-seed-link-2026";
  const tokenHash = createHash("sha256")
    .update(tokenConviteTeste)
    .digest("hex");

  await prisma.organizationInvite.upsert({
    where: { tokenHash },
    update: {
      maxUses: 10,
      useCount: 0,
      expiresAt: new Date("2027-01-31T23:59:59-03:00"),
      revokedAt: null,
    },
    create: {
      organizationId: grupoEstudos.id,
      createdByMemberId: grupoOwner.id,
      tokenHash,
      maxUses: 10,
      useCount: 0,
      expiresAt: new Date("2027-01-31T23:59:59-03:00"),
    },
  });

  const tokenConviteEmail = "devlab-seed-email-invite-2026";
  const tokenHashEmail = createHash("sha256")
    .update(tokenConviteEmail)
    .digest("hex");

  await prisma.organizationInvite.upsert({
    where: { tokenHash: tokenHashEmail },
    update: {
      targetUserId: null,
      targetEmail: beatriz.email,
      maxUses: 1,
      useCount: 0,
      revokedAt: null,
    },
    create: {
      organizationId: grupoEstudos.id,
      createdByMemberId: grupoOwner.id,
      targetEmail: beatriz.email,
      tokenHash: tokenHashEmail,
      maxUses: 1,
    },
  });

  const solicitacaoExistente = await prisma.organizationJoinRequest.findFirst({
    where: {
      organizationId: devLab.id,
      userId: beatriz.id,
      status: OrganizationJoinRequestStatus.PENDING,
    },
  });

  if (solicitacaoExistente) {
    await prisma.organizationJoinRequest.update({
      where: { id: solicitacaoExistente.id },
      data: {
        message: "Gostaria de participar dos projetos de JavaScript.",
        reviewedByMemberId: null,
        resolvedAt: null,
      },
    });
  } else {
    await prisma.organizationJoinRequest.create({
      data: {
        organizationId: devLab.id,
        userId: beatriz.id,
        message: "Gostaria de participar dos projetos de JavaScript.",
        status: OrganizationJoinRequestStatus.PENDING,
      },
    });
  }

  // 16. Canais e permissões por cargo.
  const canalGeral = await prisma.organizationChannel.upsert({
    where: {
      organizationId_name: {
        organizationId: devLab.id,
        name: "geral",
      },
    },
    update: {
      description: "Conversa geral da organização.",
      isPrivate: false,
      archivedAt: null,
    },
    create: {
      organizationId: devLab.id,
      createdByMemberId: devLabOwner.id,
      name: "geral",
      description: "Conversa geral da organização.",
      isPrivate: false,
    },
  });

  const canalPrivado = await prisma.organizationChannel.upsert({
    where: {
      organizationId_name: {
        organizationId: devLab.id,
        name: "seguranca",
      },
    },
    update: {
      description: "Discussões internas sobre segurança e acessos.",
      isPrivate: true,
      archivedAt: null,
    },
    create: {
      organizationId: devLab.id,
      createdByMemberId: devLabOwner.id,
      name: "seguranca",
      description: "Discussões internas sobre segurança e acessos.",
      isPrivate: true,
    },
  });

  async function configurarPermissoesCanal(
    channelId: number,
    roleId: number,
    permissions: ChannelPermissionCode[],
  ) {
    for (const permission of Object.values(ChannelPermissionCode)) {
      await prisma.organizationChannelRolePermission.upsert({
        where: {
          channelId_roleId_permission: { channelId, roleId, permission },
        },
        update: { allowed: permissions.includes(permission) },
        create: {
          channelId,
          roleId,
          permission,
          allowed: permissions.includes(permission),
        },
      });
    }
  }

  const acessoCompletoCanal = Object.values(ChannelPermissionCode);
  const acessoMembroCanal = [
    ChannelPermissionCode.VIEW_CHANNEL,
    ChannelPermissionCode.SEND_MESSAGES,
    ChannelPermissionCode.ATTACH_FILES,
  ];

  for (const role of [
    cargosDevLab.proprietario,
    cargosDevLab.administrador,
  ]) {
    await configurarPermissoesCanal(canalGeral.id, role.id, acessoCompletoCanal);
    await configurarPermissoesCanal(canalPrivado.id, role.id, acessoCompletoCanal);
  }
  await configurarPermissoesCanal(
    canalGeral.id,
    cargosDevLab.membro.id,
    acessoMembroCanal,
  );
  await configurarPermissoesCanal(canalPrivado.id, cargosDevLab.membro.id, []);

  // 17. Mensagens, anexos e menções.
  async function garantirMensagemCanal(channelId: number, authorMemberId: number, content: string) {
    const existente = await prisma.channelMessage.findFirst({
      where: { channelId, content },
    });

    return existente
      ? prisma.channelMessage.update({
          where: { id: existente.id },
          data: { authorMemberId, deletedAt: null },
        })
      : prisma.channelMessage.create({
          data: { channelId, authorMemberId, content },
        });
  }

  const mensagemGeral = await garantirMensagemCanal(
    canalGeral.id,
    devLabOwner.id,
    "[SEED] Bem-vindos ao DevLab! Vamos organizar nossos estudos e projetos por aqui.",
  );
  const mensagemKaua = await garantirMensagemCanal(
    canalGeral.id,
    devLabKaua.id,
    "[SEED] Posso começar organizando a documentação do projeto?",
  );
  await prisma.channelMessageMention.upsert({
    where: {
      messageId_userId: { messageId: mensagemKaua.id, userId: matheus.id },
    },
    update: {},
    create: { messageId: mensagemKaua.id, userId: matheus.id },
  });

  await prisma.channelMessageAttachment.upsert({
    where: { storageKey: "seed/devlab/geral/planejamento.pdf" },
    update: {
      originalName: "planejamento.pdf",
      mimeType: "application/pdf",
      sizeBytes: BigInt(24576),
    },
    create: {
      messageId: mensagemGeral.id,
      originalName: "planejamento.pdf",
      storageKey: "seed/devlab/geral/planejamento.pdf",
      mimeType: "application/pdf",
      sizeBytes: BigInt(24576),
    },
  });

  await garantirMensagemCanal(
    canalPrivado.id,
    devLabIgnacio.id,
    "[SEED] Revisar permissões e boas práticas de segurança antes da publicação.",
  );

  // 18. Conversa privada entre exatamente duas pessoas.
  const userA = matheus.id <= kaua.id ? matheus : kaua;
  const userB = matheus.id <= kaua.id ? kaua : matheus;
  const conversa = await prisma.directConversation.upsert({
    where: { userAId_userBId: { userAId: userA.id, userBId: userB.id } },
    update: {},
    create: { userAId: userA.id, userBId: userB.id },
  });

  async function garantirMensagemDireta(authorId: number, content: string) {
    const existente = await prisma.directMessage.findFirst({
      where: { conversationId: conversa.id, content },
    });

    return existente
      ? prisma.directMessage.update({
          where: { id: existente.id },
          data: { authorId, deletedAt: null },
        })
      : prisma.directMessage.create({
          data: { conversationId: conversa.id, authorId, content },
        });
  }

  const mensagemDM = await garantirMensagemDireta(
    matheus.id,
    "[SEED] Oi, vamos revisar o schema juntos?",
  );
  await garantirMensagemDireta(
    kaua.id,
    "[SEED] Vamos sim! Já estou olhando as relações.",
  );

  await prisma.directMessageAttachment.upsert({
    where: { storageKey: "seed/dm/schema-review.png" },
    update: {
      originalName: "schema-review.png",
      mimeType: "image/png",
      sizeBytes: BigInt(32768),
    },
    create: {
      messageId: mensagemDM.id,
      originalName: "schema-review.png",
      storageKey: "seed/dm/schema-review.png",
      mimeType: "image/png",
      sizeBytes: BigInt(32768),
    },
  });

  // 19. Projetos: um público da organização, um interno e um pessoal privado.
  async function garantirProjeto(data: {
    name: string;
    description: string;
    visibility: ProjectVisibility;
    allowDownload: boolean;
    allowContributionRequests: boolean;
    createdById: number;
    ownerUserId: number | null;
    organizationId: number | null;
  }) {
    const existente = await prisma.project.findFirst({
      where: {
        name: data.name,
        createdById: data.createdById,
        ownerUserId: data.ownerUserId,
        organizationId: data.organizationId,
      },
    });

    return existente
      ? prisma.project.update({
          where: { id: existente.id },
          data: {
            description: data.description,
            visibility: data.visibility,
            allowDownload: data.allowDownload,
            allowContributionRequests: data.allowContributionRequests,
            deletedAt: null,
          },
        })
      : prisma.project.create({ data });
  }

  const projetoPublico = await garantirProjeto({
    name: "Portal DevLab",
    description:
      "Portal demonstrativo desenvolvido em equipe para compartilhar materiais e experiências de programação.",
    visibility: ProjectVisibility.PUBLIC,
    allowDownload: true,
    allowContributionRequests: true,
    createdById: matheus.id,
    ownerUserId: null,
    organizationId: devLab.id,
  });

  const projetoInterno = await garantirProjeto({
    name: "Biblioteca interna de estudos",
    description: "Materiais e exemplos compartilhados apenas com membros do DevLab.",
    visibility: ProjectVisibility.ORGANIZATION,
    allowDownload: false,
    allowContributionRequests: false,
    createdById: ignacio.id,
    ownerUserId: null,
    organizationId: devLab.id,
  });

  const projetoPessoal = await garantirProjeto({
    name: "Painel pessoal de estudos",
    description: "Projeto individual para organizar conteúdos e progresso de estudos.",
    visibility: ProjectVisibility.PRIVATE,
    allowDownload: false,
    allowContributionRequests: false,
    createdById: matheus.id,
    ownerUserId: matheus.id,
    organizationId: null,
  });

  // 20. Cargos e permissões de cada projeto.
  async function prepararCargosProjeto(projectId: number) {
    await prisma.projectRole.updateMany({
      where: { projectId, isDefault: true },
      data: { isDefault: false },
    });

    const proprietario = await prisma.projectRole.upsert({
      where: { projectId_name: { projectId, name: "Responsável" } },
      update: { description: "Responsável pela administração do projeto.", isDefault: false },
      create: {
        projectId,
        name: "Responsável",
        description: "Responsável pela administração do projeto.",
        isDefault: false,
      },
    });

    const colaborador = await prisma.projectRole.upsert({
      where: { projectId_name: { projectId, name: "Colaborador" } },
      update: { description: "Pode contribuir com o desenvolvimento.", isDefault: true },
      create: {
        projectId,
        name: "Colaborador",
        description: "Pode contribuir com o desenvolvimento.",
        isDefault: true,
      },
    });

    const visualizador = await prisma.projectRole.upsert({
      where: { projectId_name: { projectId, name: "Visualizador" } },
      update: { description: "Pode acompanhar o projeto.", isDefault: false },
      create: {
        projectId,
        name: "Visualizador",
        description: "Pode acompanhar o projeto.",
        isDefault: false,
      },
    });

    const permissoes = Object.values(ProjectPermissionCode);
    const permissoesPorCargo: Record<string, ProjectPermissionCode[]> = {
      PROPRIETARIO: permissoes,
      COLABORADOR: [
        ProjectPermissionCode.EDIT_DESCRIPTION,
        ProjectPermissionCode.UPLOAD_FILES,
        ProjectPermissionCode.MANAGE_TASKS,
        ProjectPermissionCode.VIEW_HISTORY,
      ],
      VISUALIZADOR: [],
    };

    for (const [key, role] of [
      ["PROPRIETARIO", proprietario],
      ["COLABORADOR", colaborador],
      ["VISUALIZADOR", visualizador],
    ] as const) {
      const permitidas = permissoesPorCargo[key] ?? [];
      for (const permission of permissoes) {
        await prisma.projectRolePermission.upsert({
          where: { roleId_permission: { roleId: role.id, permission } },
          update: { allowed: permitidas.includes(permission) },
          create: {
            roleId: role.id,
            permission,
            allowed: permitidas.includes(permission),
          },
        });
      }
    }

    return { proprietario, colaborador, visualizador };
  }

  async function garantirMembroProjeto(projectId: number, userId: number, roleId: number) {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: {
        roleId,
        status: ProjectMemberStatus.ACTIVE,
        leftAt: null,
        removedAt: null,
      },
      create: { projectId, userId, roleId, status: ProjectMemberStatus.ACTIVE },
    });
  }

  const cargosProjetoPublico = await prepararCargosProjeto(projetoPublico.id);
  const membroMatheusPublico = await garantirMembroProjeto(
    projetoPublico.id,
    matheus.id,
    cargosProjetoPublico.proprietario.id,
  );
  const membroKauaPublico = await garantirMembroProjeto(
    projetoPublico.id,
    kaua.id,
    cargosProjetoPublico.colaborador.id,
  );
  // Marcos colabora diretamente no projeto, sem ser membro do DevLab.
  await garantirMembroProjeto(
    projetoPublico.id,
    marcos.id,
    cargosProjetoPublico.colaborador.id,
  );

  await prisma.projectMemberPermission.upsert({
    where: {
      memberId_permission: {
        memberId: membroKauaPublico.id,
        permission: ProjectPermissionCode.UPLOAD_FILES,
      },
    },
    update: { allowed: false },
    create: {
      memberId: membroKauaPublico.id,
      permission: ProjectPermissionCode.UPLOAD_FILES,
      allowed: false,
    },
  });

  const cargosProjetoInterno = await prepararCargosProjeto(projetoInterno.id);
  await garantirMembroProjeto(
    projetoInterno.id,
    matheus.id,
    cargosProjetoInterno.proprietario.id,
  );
  await garantirMembroProjeto(
    projetoInterno.id,
    ignacio.id,
    cargosProjetoInterno.colaborador.id,
  );

  const cargosProjetoPessoal = await prepararCargosProjeto(projetoPessoal.id);
  await garantirMembroProjeto(
    projetoPessoal.id,
    matheus.id,
    cargosProjetoPessoal.proprietario.id,
  );
  await garantirMembroProjeto(
    projetoPessoal.id,
    ignacio.id,
    cargosProjetoPessoal.visualizador.id,
  );
  const membroKauaProjetoPessoal = await garantirMembroProjeto(
    projetoPessoal.id,
    kaua.id,
    cargosProjetoPessoal.colaborador.id,
  );
  await prisma.projectMember.update({
    where: { id: membroKauaProjetoPessoal.id },
    data: {
      status: ProjectMemberStatus.LEFT,
      leftAt: new Date("2026-11-04T18:30:00-03:00"),
      removedAt: null,
    },
  });

  // 21. Versões e arquivos de projeto.
  async function garantirVersao(projectId: number, versionNumber: number, createdById: number, description: string) {
    return prisma.projectVersion.upsert({
      where: { projectId_versionNumber: { projectId, versionNumber } },
      update: { description, createdById },
      create: { projectId, versionNumber, createdById, description },
    });
  }

  const versaoAntiga = await garantirVersao(
    projetoPublico.id,
    1,
    matheus.id,
    "Primeira versão de demonstração.",
  );
  const versaoAtual = await garantirVersao(
    projetoPublico.id,
    2,
    kaua.id,
    "Atualização com documentação e ajustes de navegação.",
  );

  await prisma.projectFile.upsert({
    where: { storageKey: "seed/projects/portal-devlab/v1/projeto-inicial.zip" },
    update: {
      versionId: versaoAntiga.id,
      uploadedById: matheus.id,
      originalName: "projeto-inicial.zip",
      isCurrent: false,
      removedAt: new Date("2026-11-03T12:00:00-03:00"),
      sizeBytes: BigInt(51200),
    },
    create: {
      versionId: versaoAntiga.id,
      uploadedById: matheus.id,
      originalName: "projeto-inicial.zip",
      storageKey: "seed/projects/portal-devlab/v1/projeto-inicial.zip",
      mimeType: "application/zip",
      sizeBytes: BigInt(51200),
      isCurrent: false,
      removedAt: new Date("2026-11-03T12:00:00-03:00"),
    },
  });

  await prisma.projectFile.upsert({
    where: { storageKey: "seed/projects/portal-devlab/v2/portal-devlab.zip" },
    update: {
      versionId: versaoAtual.id,
      uploadedById: kaua.id,
      originalName: "portal-devlab.zip",
      isCurrent: true,
      removedAt: null,
      sizeBytes: BigInt(81920),
    },
    create: {
      versionId: versaoAtual.id,
      uploadedById: kaua.id,
      originalName: "portal-devlab.zip",
      storageKey: "seed/projects/portal-devlab/v2/portal-devlab.zip",
      mimeType: "application/zip",
      sizeBytes: BigInt(81920),
      isCurrent: true,
    },
  });

  const versaoPainelPessoal = await garantirVersao(
    projetoPessoal.id,
    1,
    matheus.id,
    "Versão inicial do painel pessoal.",
  );

  await prisma.projectFile.upsert({
    where: { storageKey: "seed/projects/painel-estudos/readme.pdf" },
    update: {
      uploadedById: matheus.id,
      originalName: "readme.pdf",
      isCurrent: true,
      removedAt: null,
      sizeBytes: BigInt(16384),
    },
    create: {
      versionId: versaoPainelPessoal.id,
      uploadedById: matheus.id,
      originalName: "readme.pdf",
      storageKey: "seed/projects/painel-estudos/readme.pdf",
      mimeType: "application/pdf",
      sizeBytes: BigInt(16384),
      isCurrent: true,
    },
  });

  // 22. Solicitação de contribuição de alguém que não é membro do projeto.
  let contribuicao = await prisma.projectContributionRequest.findFirst({
    where: {
      projectId: projetoPublico.id,
      requesterId: beatriz.id,
      message: "[SEED] Proposta de melhoria na documentação do portal.",
    },
  });

  contribuicao = contribuicao
    ? await prisma.projectContributionRequest.update({
        where: { id: contribuicao.id },
        data: {
          status: ProjectContributionStatus.PENDING,
          reviewedById: null,
          reviewedAt: null,
        },
      })
    : await prisma.projectContributionRequest.create({
        data: {
          projectId: projetoPublico.id,
          requesterId: beatriz.id,
          message: "[SEED] Proposta de melhoria na documentação do portal.",
          status: ProjectContributionStatus.PENDING,
        },
      });

  await prisma.projectContributionAttachment.upsert({
    where: { storageKey: "seed/contributions/beatriz/documentacao.patch" },
    update: {
      requestId: contribuicao.id,
      originalName: "documentacao.patch",
      mimeType: "text/plain",
      sizeBytes: BigInt(4096),
    },
    create: {
      requestId: contribuicao.id,
      originalName: "documentacao.patch",
      storageKey: "seed/contributions/beatriz/documentacao.patch",
      mimeType: "text/plain",
      sizeBytes: BigInt(4096),
    },
  });

  // 23. Tarefas independentes para organização e projeto.
  const tarefaOrgExistente = await prisma.organizationTask.findFirst({
    where: {
      organizationId: devLab.id,
      title: "Revisar documentação inicial",
    },
  });

  const tarefaOrg = tarefaOrgExistente
    ? await prisma.organizationTask.update({
        where: { id: tarefaOrgExistente.id },
        data: {
          description: "Conferir os materiais e organizar os links de referência.",
          status: WorkItemStatus.IN_PROGRESS,
          dueAt: new Date("2026-11-20T23:59:00-03:00"),
          createdByMemberId: devLabOwner.id,
        },
      })
    : await prisma.organizationTask.create({
        data: {
          organizationId: devLab.id,
          createdByMemberId: devLabOwner.id,
          title: "Revisar documentação inicial",
          description: "Conferir os materiais e organizar os links de referência.",
          status: WorkItemStatus.IN_PROGRESS,
          dueAt: new Date("2026-11-20T23:59:00-03:00"),
        },
      });

  await prisma.organizationTaskAssignee.upsert({
    where: { taskId_memberId: { taskId: tarefaOrg.id, memberId: devLabKaua.id } },
    update: {},
    create: { taskId: tarefaOrg.id, memberId: devLabKaua.id },
  });

  const tarefaProjetoExistente = await prisma.projectTask.findFirst({
    where: {
      projectId: projetoPublico.id,
      title: "Publicar arquivos da versão 2",
    },
  });

  const tarefaProjeto = tarefaProjetoExistente
    ? await prisma.projectTask.update({
        where: { id: tarefaProjetoExistente.id },
        data: {
          description: "Conferir os arquivos atuais e preparar a publicação.",
          status: WorkItemStatus.TODO,
          dueAt: new Date("2026-11-18T23:59:00-03:00"),
          createdById: matheus.id,
        },
      })
    : await prisma.projectTask.create({
        data: {
          projectId: projetoPublico.id,
          createdById: matheus.id,
          title: "Publicar arquivos da versão 2",
          description: "Conferir os arquivos atuais e preparar a publicação.",
          status: WorkItemStatus.TODO,
          dueAt: new Date("2026-11-18T23:59:00-03:00"),
        },
      });

  await prisma.projectTaskAssignee.upsert({
    where: {
      taskId_memberId: { taskId: tarefaProjeto.id, memberId: membroMatheusPublico.id },
    },
    update: {},
    create: { taskId: tarefaProjeto.id, memberId: membroMatheusPublico.id },
  });
  await prisma.projectTaskAssignee.upsert({
    where: {
      taskId_memberId: { taskId: tarefaProjeto.id, memberId: membroKauaPublico.id },
    },
    update: {},
    create: { taskId: tarefaProjeto.id, memberId: membroKauaPublico.id },
  });

  // 24. Curtidas, favoritos e histórico.
  await prisma.projectLike.upsert({
    where: { projectId_userId: { projectId: projetoPublico.id, userId: kaua.id } },
    update: {},
    create: { projectId: projetoPublico.id, userId: kaua.id },
  });
  await prisma.projectFavorite.upsert({
    where: { projectId_userId: { projectId: projetoPublico.id, userId: matheus.id } },
    update: {},
    create: { projectId: projetoPublico.id, userId: matheus.id },
  });

  const eventoOrgExistente = await prisma.organizationEvent.findFirst({
    where: {
      organizationId: devLab.id,
      eventType: "SEED_ORGANIZATION_CREATED",
    },
  });
  if (!eventoOrgExistente) {
    await prisma.organizationEvent.create({
      data: {
        organizationId: devLab.id,
        actorMemberId: devLabOwner.id,
        eventType: "SEED_ORGANIZATION_CREATED",
        details: { source: "seed", description: "Evento inicial de teste." },
      },
    });
  }

  const eventoProjetoExistente = await prisma.projectEvent.findFirst({
    where: {
      projectId: projetoPublico.id,
      eventType: "SEED_PROJECT_CREATED",
    },
  });
  if (!eventoProjetoExistente) {
    await prisma.projectEvent.create({
      data: {
        projectId: projetoPublico.id,
        actorId: matheus.id,
        eventType: "SEED_PROJECT_CREATED",
        details: { source: "seed", description: "Projeto público de demonstração." },
      },
    });
  }

  console.log("Organizações e projetos populados!");
  console.log(`Token de convite por link (teste): ${tokenConviteTeste}`);
  console.log(`Token de convite por e-mail (teste): ${tokenConviteEmail}`);
}

async function main() {
  console.log("Iniciando seed...");

  // 1. Perfis e permissões
  for (const roleData of roles) {
    const { code, ...dados } = roleData;

    await prisma.role.upsert({
      where: { code },
      update: dados,
      create: roleData,
    });
  }

  // 2. Usuários e funções
  for (const usuarioData of usuarios) {
    const { email, roles: funcoes, ...dadosUsuario } = usuarioData;
    const senhaHash = await hashPassword(dadosUsuario.password);
    const dadosUsuarioComSenhaHash = {
      ...dadosUsuario,
      password: senhaHash,
    };

    const usuario = await prisma.user.upsert({
      where: { email },
      update: dadosUsuarioComSenhaHash,
      create: { email, ...dadosUsuarioComSenhaHash },
    });

    for (const code of funcoes) {
      const role = await prisma.role.findUniqueOrThrow({ where: { code } });

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: usuario.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: usuario.id,
          roleId: role.id,
        },
      });
    }
  }

  // 3. Matérias
  for (const materia of materias) {
    const { code, ...dados } = materia;

    await prisma.subject.upsert({
      where: { code },
      update: dados,
      create: materia,
    });
  }

  // 4. Turmas e professores responsáveis
  for (const turmaData of turmas) {
    const { teacherEmail, subjectCodes, ...dadosTurma } = turmaData;

    await prisma.classGroup.upsert({
      where: { code: dadosTurma.code },
      update: {
        name: dadosTurma.name,
        description: dadosTurma.description,
        teacher: { connect: { email: teacherEmail } },
      },
      create: {
        ...dadosTurma,
        teacher: { connect: { email: teacherEmail } },
      },
    });

    // 5. Oferta de matérias por turma (ClassSubject explícito)
    const turma = await buscarTurma(dadosTurma.code);

    for (const subjectCode of subjectCodes) {
      const materia = await buscarMateria(subjectCode);

      await prisma.classSubject.upsert({
        where: {
          classGroupId_subjectId: {
            classGroupId: turma.id,
            subjectId: materia.id,
          },
        },
        update: {},
        create: {
          classGroup: { connect: { id: turma.id } },
          subject: { connect: { id: materia.id } },
        },
      });
    }
  }

  // 6. Matrículas
  for (const matricula of matriculas) {
    const usuario = await prisma.user.findUniqueOrThrow({
      where: { email: matricula.userEmail },
    });
    const turma = await buscarTurma(matricula.classCode);

    const activatedAt =
      matricula.status === EnrollmentStatus.ACTIVE
        ? new Date("2026-10-01T12:00:00-03:00")
        : null;

    await prisma.enrollment.upsert({
      where: {
        userId_classId: {
          userId: usuario.id,
          classId: turma.id,
        },
      },
      update: {
        status: matricula.status,
        activatedAt,
      },
      create: {
        status: matricula.status,
        activatedAt,
        user: { connect: { id: usuario.id } },
        classGroup: { connect: { id: turma.id } },
      },
    });
  }

  // 7. Conteúdos e anexos
  for (const conteudoData of conteudos) {
    const turma = await buscarTurma(conteudoData.classCode);
    const autor = await prisma.user.findUniqueOrThrow({
      where: { email: conteudoData.authorEmail },
    });
    const materiaDaTurma = conteudoData.subjectCode
      ? await buscarMateriaDaTurma(conteudoData.classCode, conteudoData.subjectCode)
      : null;

    const existente = await prisma.learningContent.findFirst({
      where: {
        title: conteudoData.title,
        classGroupId: turma.id,
      },
    });

    const conteudo = existente
      ? await prisma.learningContent.update({
          where: { id: existente.id },
          data: {
            body: conteudoData.body,
            createdBy: { connect: { id: autor.id } },
            classSubject: materiaDaTurma
              ? { connect: { id: materiaDaTurma.id } }
              : { disconnect: true },
          },
        })
      : await prisma.learningContent.create({
          data: {
            title: conteudoData.title,
            body: conteudoData.body,
            classGroup: { connect: { id: turma.id } },
            ...(materiaDaTurma
              ? { classSubject: { connect: { id: materiaDaTurma.id } } }
              : {}),
            createdBy: { connect: { id: autor.id } },
          },
        });

    if (conteudoData.attachment) {
      const anexo = await prisma.contentAttachment.findFirst({
        where: {
          contentId: conteudo.id,
          fileName: conteudoData.attachment.fileName,
        },
      });

      if (anexo) {
        await prisma.contentAttachment.update({
          where: { id: anexo.id },
          data: {
            url: conteudoData.attachment.url,
            mimeType: conteudoData.attachment.mimeType,
          },
        });
      } else {
        await prisma.contentAttachment.create({
          data: {
            ...conteudoData.attachment,
            content: { connect: { id: conteudo.id } },
          },
        });
      }
    }
  }

  // 8. Aulas/sessões
  for (const aulaData of aulas) {
    const turma = await buscarTurma(aulaData.classCode);
    const materiaDaTurma = aulaData.subjectCode
      ? await buscarMateriaDaTurma(aulaData.classCode, aulaData.subjectCode)
      : null;

    const existente = await prisma.classSession.findFirst({
      where: {
        title: aulaData.title,
        classGroupId: turma.id,
        scheduledStart: aulaData.scheduledStart,
      },
    });

    if (existente) {
      await prisma.classSession.update({
        where: { id: existente.id },
        data: {
          description: aulaData.description,
          scheduledEnd: aulaData.scheduledEnd,
          meetingUrl: aulaData.meetingUrl,
          status: aulaData.status,
          classSubject: materiaDaTurma
            ? { connect: { id: materiaDaTurma.id } }
            : { disconnect: true },
        },
      });
    } else {
      await prisma.classSession.create({
        data: {
          title: aulaData.title,
          description: aulaData.description,
          scheduledStart: aulaData.scheduledStart,
          scheduledEnd: aulaData.scheduledEnd,
          meetingUrl: aulaData.meetingUrl,
          status: aulaData.status,
          classGroup: { connect: { id: turma.id } },
          ...(materiaDaTurma
            ? { classSubject: { connect: { id: materiaDaTurma.id } } }
            : {}),
        },
      });
    }
  }

  // 9. Atividades
  for (const atividadeData of atividades) {
    const materiaDaTurma = await buscarMateriaDaTurma(
      atividadeData.classCode,
      atividadeData.subjectCode,
    );

    const existente = await prisma.activity.findFirst({
      where: {
        title: atividadeData.title,
        classSubjectId: materiaDaTurma.id,
      },
    });

    const dados = {
      description: atividadeData.description,
      dueAt: atividadeData.dueAt,
      submissionMode: atividadeData.submissionMode,
      maxPoints: atividadeData.maxPoints,
      allowLateSubmissions: atividadeData.allowLateSubmissions,
      isPublished: true,
    };

    if (existente) {
      await prisma.activity.update({
        where: { id: existente.id },
        data: dados,
      });
    } else {
      await prisma.activity.create({
        data: {
          title: atividadeData.title,
          ...dados,
          classSubject: { connect: { id: materiaDaTurma.id } },
        },
      });
    }
  }

  // 10. Entregas, integrantes e anexos
  for (const entregaData of entregas) {
    const materiaDaTurma = await buscarMateriaDaTurma(
      entregaData.classCode,
      entregaData.subjectCode,
    );

    const atividade = await prisma.activity.findFirstOrThrow({
      where: {
        title: entregaData.activityTitle,
        classSubjectId: materiaDaTurma.id,
      },
    });

    const matriculasDaEntrega = [];
    for (const email of entregaData.studentEmails) {
      const matricula = await buscarMatricula(email, entregaData.classCode);

      if (matricula.status !== EnrollmentStatus.ACTIVE) {
        throw new Error(
          `A matrícula de ${email} na turma ${entregaData.classCode} não está ativa.`,
        );
      }

      matriculasDaEntrega.push(matricula);
    }

    let entrega = await prisma.submission.findFirst({
      where: {
        activityId: atividade.id,
        textAnswer: entregaData.textAnswer,
      },
    });

    if (entrega) {
      entrega = await prisma.submission.update({
        where: { id: entrega.id },
        data: {
          grade: entregaData.grade,
          feedback: entregaData.feedback,
        },
      });
    } else {
      entrega = await prisma.submission.create({
        data: {
          textAnswer: entregaData.textAnswer,
          grade: entregaData.grade,
          feedback: entregaData.feedback,
          activity: { connect: { id: atividade.id } },
        },
      });
    }

    for (const matricula of matriculasDaEntrega) {
      await prisma.submissionMember.upsert({
        where: {
          activityId_enrollmentId: {
            activityId: atividade.id,
            enrollmentId: matricula.id,
          },
        },
        update: {
          submissionId: entrega.id,
        },
        create: {
          submissionId: entrega.id,
          activityId: atividade.id,
          enrollmentId: matricula.id,
        },
      });
    }

    if (entregaData.attachment) {
      const anexo = await prisma.submissionAttachment.findFirst({
        where: {
          submissionId: entrega.id,
          fileName: entregaData.attachment.fileName,
        },
      });

      if (anexo) {
        await prisma.submissionAttachment.update({
          where: { id: anexo.id },
          data: {
            url: entregaData.attachment.url,
            mimeType: entregaData.attachment.mimeType,
          },
        });
      } else {
        await prisma.submissionAttachment.create({
          data: {
            ...entregaData.attachment,
            submission: { connect: { id: entrega.id } },
          },
        });
      }
    }
  }

  // 11. Presenças
  for (const presencaData of presencas) {
    const matricula = await buscarMatricula(
      presencaData.studentEmail,
      presencaData.classCode,
    );
    const turma = await buscarTurma(presencaData.classCode);

    const aula = await prisma.classSession.findFirstOrThrow({
      where: {
        title: presencaData.sessionTitle,
        classGroupId: turma.id,
        scheduledStart: presencaData.sessionStartsAt,
      },
    });

    await prisma.attendance.upsert({
      where: {
        enrollmentId_sessionId: {
          enrollmentId: matricula.id,
          sessionId: aula.id,
        },
      },
      update: {
        status: presencaData.status,
        note: presencaData.note,
      },
      create: {
        enrollment: { connect: { id: matricula.id } },
        session: { connect: { id: aula.id } },
        status: presencaData.status,
        note: presencaData.note,
      },
    });
  }

  await seedOrganizacoesEProjetos();

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((error) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
