import { useEffect, useMemo, useState } from "react";
import Schedule from "../../../app/components/ui/Schedule/Schedule";
import { useLessons } from "../hooks/useLessons";
import LessonDetails from "../components/LessonDetails";
import LessonFilters from "../components/LessonFilters";
import LessonList from "../components/LessonList";
import LessonState from "../components/LessonState";
import LessonsBoard from "../components/board/LessonsBoard";
import NextLessonCard from "../components/NextLessonCard";
import StatCard from "../components/StatCard";
import { toScheduleEvent } from "../utils/lessonMapper";
import "./LessonsPage.css";

const VIEW_STORAGE_KEY = "gurus-educa-lessons-view";

function readInitialViewMode() {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "agenda";
  } catch {
    return "agenda";
  }
}

/**
 * View Aulas: próxima aula, indicadores, filtros e agenda/lista de encontros.
 *
 * Quando `embedded` é verdadeiro, a view é renderizada dentro de outro contexto
 * (ex.: opção Aulas de uma comunidade) e usa o quadro da comunidade, com hero,
 * chips de filtro e resumo lateral da turma.
 *
 * @param {{ embedded?: boolean, community?: { description?: string }|null }} props
 * @returns {JSX.Element}
 */
export default function LessonsPage({ embedded = false, community = null }) {
  const [viewMode, setViewMode] = useState(readInitialViewMode);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const {
    lessons,
    filteredLessons,
    nextLesson,
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
  } = useLessons();

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      // localStorage indisponível: a preferência não é persistida.
    }
  }, [viewMode]);

  const scheduleEvents = useMemo(
    () => filteredLessons.map(toScheduleEvent),
    [filteredLessons],
  );

  const isLoading = status === "loading";
  const isInitialLoading = isLoading && lessons.length === 0;
  const hasResults = filteredLessons.length > 0;

  function handleToggleViewMode() {
    setViewMode((current) => (current === "agenda" ? "list" : "agenda"));
  }

  function handleOpenDetails(lesson) {
    setSelectedLesson(lesson);
  }

  function handleCloseDetails() {
    setSelectedLesson(null);
  }

  function handleScheduleSelection(event) {
    const lesson = filteredLessons.find((item) => item.id === event.id);
    if (lesson) {
      setSelectedLesson(lesson);
    }
  }

  if (embedded) {
    return (
      <section className="lessons-page lessons-page--embedded" aria-busy={isInitialLoading}>
        {isInitialLoading ? (
          <LessonState status="loading" />
        ) : status === "error" ? (
          <LessonState status="error" error={error} onRetry={reload} />
        ) : lessons.length === 0 ? (
          <LessonState status="empty" />
        ) : (
          <LessonsBoard
            lessons={lessons}
            filteredLessons={filteredLessons}
            nextLesson={nextLesson}
            classGroups={classGroups}
            classSubjects={classSubjects}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
            community={community}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {selectedLesson && (
          <LessonDetails lesson={selectedLesson} onClose={handleCloseDetails} />
        )}
      </section>
    );
  }

  return (
    <section className={`lessons-page${embedded ? " lessons-page--embedded" : ""}`} aria-busy={isInitialLoading}>
      <header className="lessons-page__header">
        <div>
          <p className="lessons-page__eyebrow">Agenda acadêmica</p>
          {embedded ? (
            <h2 className="lessons-page__title">Aulas</h2>
          ) : (
            <h1 className="lessons-page__title">Aulas</h1>
          )}
        </div>
        <p className="lessons-page__subtitle">
          Acompanhe seus encontros, horários e atividades presenciais ou online.
        </p>
      </header>

      {status === "success" && (
        <>
          <NextLessonCard lesson={nextLesson} onOpenDetails={handleOpenDetails} />

          <ul className="lessons-page__stats" aria-label="Indicadores de aulas">
            <li>
              <StatCard label="Próximas aulas" value={stats.upcoming} tone="roxo" />
            </li>
            <li>
              <StatCard label="Aulas nesta semana" value={stats.thisWeek} tone="verde" />
            </li>
            <li>
              <StatCard label="Aulas realizadas" value={stats.completed} tone="verde" />
            </li>
          </ul>

          <LessonFilters
            filters={filters}
            classGroups={classGroups}
            classSubjects={classSubjects}
            viewMode={viewMode}
            hasActiveFilters={hasActiveFilters}
            onFiltersChange={updateFilters}
            onResetFilters={resetFilters}
            onToggleViewMode={handleToggleViewMode}
          />
        </>
      )}

      {isInitialLoading ? (
        <LessonState status="loading" />
      ) : status === "error" ? (
        <LessonState status="error" error={error} onRetry={reload} />
      ) : lessons.length === 0 ? (
        <LessonState status="empty" />
      ) : !hasResults ? (
        <LessonState status="search" onRetry={resetFilters} />
      ) : viewMode === "agenda" ? (
        <div className="lessons-page__agenda">
          <Schedule
            eventos={scheduleEvents}
            onSelecionarEvento={handleScheduleSelection}
          />
        </div>
      ) : (
        <LessonList lessons={filteredLessons} onOpenDetails={handleOpenDetails} />
      )}

      {selectedLesson && (
        <LessonDetails lesson={selectedLesson} onClose={handleCloseDetails} />
      )}
    </section>
  );
}
