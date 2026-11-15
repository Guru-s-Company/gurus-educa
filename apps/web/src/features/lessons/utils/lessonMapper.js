/**
 * @file Mapeamento, rótulos e adaptadores da feature Aulas.
 *
 * Mantém a tradução dos estados da sessão e a conversão do contrato
 * acadêmico para o formato esperado pelo componente Schedule, sem
 * acoplar o Schedule à estrutura do backend.
 */

import { formatTime, toDate, toLocalDateKey } from "./lessonDate";

/**
 * @typedef {Object} Lesson
 * @property {string|number} id
 * @property {string} title
 * @property {string|null} [description]
 * @property {string} scheduledStart - Data/hora em ISO 8601.
 * @property {string|null} [scheduledEnd]
 * @property {string|null} [meetingUrl]
 * @property {"SCHEDULED"|"POSTPONED"|"CANCELLED"|"COMPLETED"} status
 * @property {{ id: number, name: string, code: string }|null} [classGroup]
 * @property {{ id: number, subject: { id: number, name: string, code: string } }|null} [classSubject]
 * @property {{ id: number, name: string }|null} [teacher]
 * @property {Object|null} [attendance]
 */

export const LESSON_STATUS = Object.freeze({
  SCHEDULED: "SCHEDULED",
  POSTPONED: "POSTPONED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
});

export const LESSON_STATUS_LABELS = Object.freeze({
  SCHEDULED: "Agendada",
  POSTPONED: "Remarcada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
});

/**
 * Traduz o estado da sessão para o rótulo em português.
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  return LESSON_STATUS_LABELS[status] ?? status ?? "Sem situação";
}

/**
 * @param {Lesson} lesson
 * @returns {string|null}
 */
export function getClassGroupName(lesson) {
  return lesson?.classGroup?.name ?? null;
}

/**
 * @param {Lesson} lesson
 * @returns {string|null}
 */
export function getSubjectName(lesson) {
  return lesson?.classSubject?.subject?.name ?? null;
}

/**
 * @param {Lesson} lesson
 * @returns {string|null}
 */
export function getTeacherName(lesson) {
  return lesson?.teacher?.name ?? null;
}

/**
 * Só considera o endereço utilizável quando for uma URL http(s) válida.
 * @param {Lesson} lesson
 * @returns {boolean}
 */
export function hasValidMeetingUrl(lesson) {
  const url = lesson?.meetingUrl;

  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Garante que os campos opcionais existam, sem preencher lacunas
 * com valores inventados.
 * @param {Lesson} raw
 * @returns {Lesson}
 */
export function normalizeLesson(raw) {
  return {
    ...raw,
    description: raw.description ?? null,
    scheduledEnd: raw.scheduledEnd ?? null,
    meetingUrl: raw.meetingUrl ?? null,
    classGroup: raw.classGroup ?? null,
    classSubject: raw.classSubject ?? null,
    teacher: raw.teacher ?? null,
    attendance: raw.attendance ?? null,
  };
}

const AGENDA_STATUS_SUFFIX = {
  [LESSON_STATUS.CANCELLED]: " (cancelada)",
  [LESSON_STATUS.POSTPONED]: " (remarcada)",
};

/**
 * Adapta um encontro para o formato do componente Schedule:
 * `{ id, data, tipo, titulo, inicio, fim, local }`.
 *
 * O sufixo de situação mantém cancelamento e remarcação visíveis na
 * agenda sem alterar o componente compartilhado.
 * @param {Lesson} lesson
 * @returns {{ id: string|number, data: string, tipo: string, titulo: string, inicio: string, fim: string|null, local: string|null }}
 */
export function toScheduleEvent(lesson) {
  const start = toDate(lesson.scheduledStart);
  const end = toDate(lesson.scheduledEnd);
  const suffix = AGENDA_STATUS_SUFFIX[lesson.status] ?? "";

  return {
    id: lesson.id,
    data: start ? toLocalDateKey(start) : "",
    tipo: "aula",
    titulo: `${lesson.title}${suffix}`,
    inicio: start ? formatTime(start) : "",
    fim: end ? formatTime(end) : null,
    local: hasValidMeetingUrl(lesson) ? "Sala virtual" : null,
  };
}