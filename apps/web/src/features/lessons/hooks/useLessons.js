import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { lessonsService } from "../services/lessonsService";
import { isInCurrentWeek, isUpcoming, toDate } from "../utils/lessonDate";
import { LESSON_STATUS } from "../utils/lessonMapper";

const DEFAULT_FILTERS = Object.freeze({
  search: "",
  classGroupId: "",
  classSubjectId: "",
  status: "",
});

function compareByStart(a, b) {
  const startA = toDate(a.scheduledStart)?.getTime() ?? 0;
  const startB = toDate(b.scheduledStart)?.getTime() ?? 0;
  return startA - startB;
}

function isUpcomingLesson(lesson, reference) {
  const isPending =
    lesson.status === LESSON_STATUS.SCHEDULED || lesson.status === LESSON_STATUS.POSTPONED;

  return isPending && isUpcoming(lesson.scheduledStart, reference);
}

/**
 * Filtra os encontros sobre a fonte de dados única carregada.
 * @param {import("../utils/lessonMapper").Lesson[]} lessons
 * @param {{ search: string, classGroupId: string, classSubjectId: string, status: string }} filters
 */
function applyFilters(lessons, filters) {
  const search = filters.search.trim().toLowerCase();

  return lessons
    .filter((lesson) => {
      if (search && !lesson.title.toLowerCase().includes(search)) {
        return false;
      }

      if (
        filters.classGroupId &&
        String(lesson.classGroup?.id ?? "") !== filters.classGroupId
      ) {
        return false;
      }

      if (
        filters.classSubjectId &&
        String(lesson.classSubject?.id ?? "") !== filters.classSubjectId
      ) {
        return false;
      }

      if (filters.status && lesson.status !== filters.status) {
        return false;
      }

      return true;
    })
    .sort(compareByStart);
}

function getUpcomingLessons(lessons) {
  const reference = new Date();

  return lessons
    .filter((lesson) => isUpcomingLesson(lesson, reference))
    .sort(compareByStart);
}

function getNextLesson(lessons) {
  return getUpcomingLessons(lessons)[0] ?? null;
}

function getLessonStats(lessons) {
  const reference = new Date();

  const upcoming = lessons.filter((lesson) => isUpcomingLesson(lesson, reference)).length;

  const thisWeek = lessons.filter(
    (lesson) =>
      lesson.status !== LESSON_STATUS.CANCELLED &&
      isInCurrentWeek(lesson.scheduledStart, reference),
  ).length;

  const completed = lessons.filter(
    (lesson) => lesson.status === LESSON_STATUS.COMPLETED,
  ).length;

  return { upcoming, thisWeek, completed };
}

function getClassGroupOptions(lessons) {
  const groups = new Map();

  lessons.forEach((lesson) => {
    if (lesson.classGroup?.id != null) {
      groups.set(String(lesson.classGroup.id), lesson.classGroup);
    }
  });

  return [...groups.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => ({ value: String(group.id), label: group.name }));
}

function getClassSubjectOptions(lessons) {
  const subjects = new Map();

  lessons.forEach((lesson) => {
    const classSubject = lesson.classSubject;
    if (classSubject?.id != null) {
      subjects.set(String(classSubject.id), classSubject);
    }
  });

  return [...subjects.values()]
    .sort((a, b) => (a.subject?.name ?? "").localeCompare(b.subject?.name ?? ""))
    .map((classSubject) => ({
      value: String(classSubject.id),
      label: classSubject.subject?.name ?? "Sem matéria",
    }));
}

/**
 * Centraliza a consulta dos encontros, o carregamento, os erros,
 * os filtros e os resultados derivados da view Aulas.
 */
export function useLessons() {
  const { accessToken } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadLessons() {
      setStatus("loading");
      setError(null);

      try {
        const result = await lessonsService.getMyLessons(accessToken, {}, {
          signal: controller.signal,
        });

        if (!isActive) {
          return;
        }

        setLessons(result);
        setStatus("success");
      } catch (requestError) {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        setError(requestError);
        setStatus("error");
      }
    }

    loadLessons();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [accessToken, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const updateFilters = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filteredLessons = useMemo(() => applyFilters(lessons, filters), [lessons, filters]);
  const nextLesson = useMemo(() => getNextLesson(lessons), [lessons]);
  const upcomingLessons = useMemo(() => getUpcomingLessons(lessons), [lessons]);
  const stats = useMemo(() => getLessonStats(lessons), [lessons]);
  const classGroups = useMemo(() => getClassGroupOptions(lessons), [lessons]);
  const classSubjects = useMemo(() => getClassSubjectOptions(lessons), [lessons]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== ""),
    [filters],
  );

  return {
    lessons,
    filteredLessons,
    nextLesson,
    upcomingLessons,
    stats,
    classGroups,
    classSubjects,
    status,
    error,
    filters,
    hasActiveFilters,
    updateFilters,
    resetFilters,
    reload,
  };
}