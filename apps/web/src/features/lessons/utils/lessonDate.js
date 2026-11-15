/**
 * @file Utilitários de data e hora da feature Aulas.
 *
 * As formatações usam Intl.DateTimeFormat com o fuso local.
 * Não derive chaves de dia de toISOString(): o deslocamento UTC pode
 * mover o encontro para o dia anterior.
 */

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateLongFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateShortFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

/**
 * Converte um valor (Date ou string ISO) em Date válida.
 * @param {Date|string|null|undefined} value
 * @returns {Date|null}
 */
export function toDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" || value === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Horário "HH:MM" no fuso local.
 * @param {Date|string|null|undefined} value
 * @returns {string}
 */
export function formatTime(value) {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : "";
}

/**
 * Data por extenso, ex.: "quinta-feira, 20 de novembro de 2026".
 * @param {Date|string|null|undefined} value
 * @returns {string}
 */
export function formatDateLong(value) {
  const date = toDate(value);
  return date ? dateLongFormatter.format(date) : "";
}

/**
 * Período "HH:MM" ou "HH:MM às HH:MM".
 * @param {Date|string|null|undefined} start
 * @param {Date|string|null|undefined} [end]
 * @returns {string}
 */
export function formatTimeRange(start, end) {
  const startTime = formatTime(start);

  if (!startTime) {
    return "";
  }

  const endTime = formatTime(end);
  return endTime ? `${startTime} às ${endTime}` : startTime;
}

/**
 * Data curta, ex.: "20/11/2026".
 * @param {Date|string|null|undefined} value
 * @returns {string}
 */
export function formatDateShort(value) {
  const date = toDate(value);
  return date ? dateShortFormatter.format(date) : "";
}

/**
 * Chave local "AAAA-MM-DD" do dia do encontro.
 * @param {Date|string|null|undefined} value
 * @returns {string}
 */
export function toLocalDateKey(value) {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {Date|string|null|undefined} value
 * @returns {Date|null}
 */
export function startOfDay(value) {
  const date = toDate(value);
  if (!date) {
    return null;
  }

  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Início da semana (segunda-feira) do valor informado.
 * @param {Date|string|null|undefined} value
 * @returns {Date|null}
 */
export function startOfWeek(value) {
  const date = startOfDay(value);
  if (!date) {
    return null;
  }

  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

/**
 * Verifica se o valor cai na mesma semana (segunda a domingo) da referência.
 * @param {Date|string|null|undefined} value
 * @param {Date|string} [reference]
 * @returns {boolean}
 */
export function isInCurrentWeek(value, reference = new Date()) {
  const date = toDate(value);
  const weekStart = startOfWeek(reference);

  if (!date || !weekStart) {
    return false;
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

/**
 * Verifica se o valor é igual ou posterior à referência.
 * @param {Date|string|null|undefined} value
 * @param {Date|string} [reference]
 * @returns {boolean}
 */
export function isUpcoming(value, reference = new Date()) {
  const date = toDate(value);
  const referenceDate = toDate(reference);

  if (!date || !referenceDate) {
    return false;
  }

  return date.getTime() >= referenceDate.getTime();
}

/**
 * Verifica se o momento atual está dentro do período do encontro.
 * @param {Date|string|null|undefined} start
 * @param {Date|string|null|undefined} [end]
 * @returns {boolean}
 */
export function isLiveNow(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate || !endDate) {
    return false;
  }

  const now = Date.now();
  return startDate.getTime() <= now && now <= endDate.getTime();
}

/**
 * Rótulo curto de dia: "Hoje", "Amanhã" ou "sex., 21 de nov.".
 * @param {Date|string|null|undefined} value
 * @returns {string}
 */
export function formatDayLabel(value) {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  const diffDays = Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return dayLabelFormatter.format(date);
}

/**
 * Duração entre dois horários, ex.: "1h30".
 * @param {Date|string|null|undefined} start
 * @param {Date|string|null|undefined} [end]
 * @returns {string}
 */
export function formatDuration(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate || !endDate || endDate.getTime() <= startDate.getTime()) {
    return "";
  }

  const totalMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) return `${hours}h${String(minutes).padStart(2, "0")}`;
  if (hours) return `${hours}h`;
  return `${minutes}min`;
}