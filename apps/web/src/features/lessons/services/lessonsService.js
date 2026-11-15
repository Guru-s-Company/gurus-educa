import { apiClient } from "../../../services/api/client";
import { lessons as mockLessons } from "../mocks/lessonsMock";
import { normalizeLesson } from "../utils/lessonMapper";

const MOCK_LATENCY_MS = 250;

function createAbortError() {
  const error = new Error("Requisição cancelada.");
  error.name = "AbortError";
  return error;
}

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);

    function handleAbort() {
      clearTimeout(timer);
      reject(createAbortError());
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

/**
 * Normaliza a resposta da API para uma lista de encontros.
 * Aceita array direto, `{ lessons }` ou `{ sessions }`.
 * @param {unknown} payload
 * @returns {import("../utils/lessonMapper").Lesson[]}
 */
function toLessonList(payload) {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.lessons ?? payload?.sessions ?? []);

  return list.map(normalizeLesson);
}

export const lessonsService = {
  /**
   * Lista os encontros (ClassSession) do usuário autenticado.
   *
   * Futuramente usa GET /sessions com os filtros suportados:
   * from, to, classGroupId, classSubjectId, status, cursor e limit.
   * O servidor identifica o usuário pelo token.
   *
   * @param {string|null} accessToken - Token obtido via useAuth().
   * @param {{ classGroupId?: string, classSubjectId?: string, status?: string }} [filters]
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<import("../utils/lessonMapper").Lesson[]>}
   */
  async getMyLessons(accessToken, filters = {}, options = {}) {
    if (!accessToken) {
      // A autenticação ainda está desligada: devolve os dados de demonstração.
      await wait(MOCK_LATENCY_MS, options.signal);
      return mockLessons.map(normalizeLesson);
    }

    const query = new URLSearchParams();

    if (filters.classGroupId) {
      query.set("classGroupId", filters.classGroupId);
    }

    if (filters.classSubjectId) {
      query.set("classSubjectId", filters.classSubjectId);
    }

    if (filters.status) {
      query.set("status", filters.status);
    }

    const search = query.toString();
    const payload = await apiClient.request(
      `/sessions${search ? `?${search}` : ""}`,
      { accessToken, signal: options.signal },
    );

    return toLessonList(payload);
  },
};