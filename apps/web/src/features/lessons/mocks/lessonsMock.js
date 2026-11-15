/**
 * @file Dados de demonstração da view Aulas.
 *
 * Conteúdo fictício, usado apenas enquanto a API de sessões não está
 * disponível. Não representa alunos, professores ou encontros reais.
 * As datas são geradas em relação ao carregamento para que a agenda
 * sempre tenha encontros futuros e anteriores.
 *
 * Os endereços de reunião usam o domínio reservado example.com apenas
 * para demonstrar o botão de sala; não são salas reais.
 */

function at(dayOffset, hour, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
}

const turmaDS = { id: 1, name: "Análise e Desenvolvimento de Sistemas", code: "2IH-DS" };
const turmaCD = { id: 2, name: "Ciência de Dados", code: "3IA-CD" };
const turmaRC = { id: 3, name: "Redes de Computadores", code: "1RC" };

const subjectJs = { id: 1, name: "JavaScript Básico", code: "JS_BASIC" };
const subjectDb = { id: 2, name: "Banco de Dados", code: "DB_INTRO" };
const subjectNet = { id: 3, name: "Redes de Computadores", code: "NET_FUND" };
const subjectGit = { id: 4, name: "Git e Versionamento", code: "GIT_FUND" };

const classSubject = (id, subject) => ({ id, subject });

export const lessons = [
  {
    id: "aula-js-intro",
    title: "Introdução ao JavaScript",
    description: "Fundamentos da linguagem: variáveis, tipos, operadores e funções.",
    scheduledStart: at(1, 19, 0),
    scheduledEnd: at(1, 20, 30),
    meetingUrl: "https://meet.example.com/ds-js-intro",
    status: "SCHEDULED",
    classGroup: turmaDS,
    classSubject: classSubject(11, subjectJs),
    teacher: { id: 1, name: "Marina Costa" },
    attendance: null,
  },
  {
    id: "aula-sql-consultas",
    title: "Consultas SQL",
    description: "Seleção, filtros e junções em bancos relacionais.",
    scheduledStart: at(2, 19, 0),
    scheduledEnd: at(2, 20, 30),
    meetingUrl: null,
    status: "SCHEDULED",
    classGroup: turmaDS,
    classSubject: classSubject(12, subjectDb),
    teacher: { id: 2, name: "Caio Ferreira" },
    attendance: null,
  },
  {
    id: "aula-redes-fundamentos",
    title: "Fundamentos de redes",
    description: "Modelo cliente-servidor, protocolos e endereçamento.",
    scheduledStart: at(4, 10, 0),
    scheduledEnd: at(4, 12, 0),
    meetingUrl: "https://meet.example.com/ds-redes-fundamentos",
    status: "SCHEDULED",
    classGroup: turmaRC,
    classSubject: classSubject(13, subjectNet),
    teacher: { id: 3, name: "Bia Nunes" },
    attendance: null,
  },
  {
    id: "aula-js-pratica",
    title: "JavaScript na prática",
    description: null,
    scheduledStart: at(6, 19, 0),
    scheduledEnd: at(6, 20, 30),
    meetingUrl: null,
    status: "SCHEDULED",
    classGroup: turmaDS,
    classSubject: classSubject(11, subjectJs),
    teacher: { id: 1, name: "Marina Costa" },
    attendance: null,
  },
  {
    id: "aula-modelagem-dados",
    title: "Modelagem de dados",
    description: "Encontro remarcado para a semana seguinte.",
    scheduledStart: at(8, 19, 0),
    scheduledEnd: at(8, 20, 30),
    meetingUrl: null,
    status: "POSTPONED",
    classGroup: turmaCD,
    classSubject: classSubject(14, subjectDb),
    teacher: { id: 2, name: "Caio Ferreira" },
    attendance: null,
  },
  {
    id: "aula-git-workshop",
    title: "Workshop de Git",
    description: "Encontro cancelado pela coordenação.",
    scheduledStart: at(3, 19, 0),
    scheduledEnd: at(3, 21, 0),
    meetingUrl: null,
    status: "CANCELLED",
    classGroup: turmaDS,
    classSubject: classSubject(15, subjectGit),
    teacher: { id: 4, name: "Léo Martins" },
    attendance: null,
  },
  {
    id: "aula-js-revisao",
    title: "Revisão de JavaScript",
    description: "Revisão dos conceitos da primeira unidade.",
    scheduledStart: at(-2, 19, 0),
    scheduledEnd: at(-2, 20, 30),
    meetingUrl: "https://meet.example.com/ds-js-revisao",
    status: "COMPLETED",
    classGroup: turmaDS,
    classSubject: classSubject(11, subjectJs),
    teacher: { id: 1, name: "Marina Costa" },
    attendance: null,
  },
  {
    id: "aula-db-introducao",
    title: "Introdução a bancos de dados",
    description: "Conceitos de tabela, registro e chave primária.",
    scheduledStart: at(-5, 19, 0),
    scheduledEnd: at(-5, 20, 30),
    meetingUrl: null,
    status: "COMPLETED",
    classGroup: turmaCD,
    classSubject: classSubject(14, subjectDb),
    teacher: { id: 2, name: "Caio Ferreira" },
    attendance: null,
  },
  {
    id: "aula-redes-ip",
    title: "Redes de computadores",
    description: "Endereçamento IP e máscaras de sub-rede.",
    scheduledStart: at(-7, 10, 0),
    scheduledEnd: at(-7, 12, 0),
    meetingUrl: null,
    status: "COMPLETED",
    classGroup: turmaRC,
    classSubject: classSubject(13, subjectNet),
    teacher: { id: 3, name: "Bia Nunes" },
    attendance: null,
  },
  {
    id: "aula-js-assincrono",
    title: "Programação assíncrona",
    description: null,
    scheduledStart: at(9, 19, 0),
    scheduledEnd: at(9, 20, 30),
    meetingUrl: null,
    status: "SCHEDULED",
    classGroup: turmaDS,
    classSubject: classSubject(11, subjectJs),
    teacher: null,
    attendance: null,
  },
  {
    id: "aula-nivelamento",
    title: "Encontro de nivelamento",
    description: "Encontro de nivelamento sem matéria associada.",
    scheduledStart: at(5, 19, 0),
    scheduledEnd: at(5, 20, 30),
    meetingUrl: null,
    status: "SCHEDULED",
    classGroup: turmaDS,
    classSubject: null,
    teacher: null,
    attendance: null,
  },
];