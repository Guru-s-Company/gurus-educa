import { useMemo, useState } from "react";
import { BookOpen, Clock, Search, UserRound } from "lucide-react";
import ActionButton from "../../../../app/components/ui/Button/ActionButton";
import InputField from "../../../../app/components/ui/Field/InputField";
import SelectField from "../../../../app/components/ui/Field/SelectField";
import { cn } from "../../../../lib/helpers";
import LessonState from "../LessonState";
import LessonStatusBadge from "../LessonStatusBadge";
import HeroLessonCard from "./HeroLessonCard";
import LessonsSidebar from "./LessonsSidebar";
import { LESSON_STATUS, getClassGroupName, getSubjectName, getTeacherName } from "../../utils/lessonMapper";
import { formatDayLabel, formatTimeRange, toDate, toLocalDateKey } from "../../utils/lessonDate";
import "./LessonsBoard.css";

const SCOPE_STATUS = {
  ativas: [LESSON_STATUS.SCHEDULED, LESSON_STATUS.POSTPONED],
  anteriores: [LESSON_STATUS.COMPLETED, LESSON_STATUS.CANCELLED],
};

const TONE_BY_STATUS = {
  [LESSON_STATUS.SCHEDULED]: "scheduled",
  [LESSON_STATUS.POSTPONED]: "postponed",
  [LESSON_STATUS.CANCELLED]: "cancelled",
  [LESSON_STATUS.COMPLETED]: "completed",
};

/**
 * @typedef {Object} LessonsBoardProps
 * @property {import("../utils/lessonMapper").Lesson[]} lessons
 * @property {import("../utils/lessonMapper").Lesson[]} filteredLessons
 * @property {import("../utils/lessonMapper").Lesson|null} nextLesson
 * @property {{ value: string, label: string }[]} classGroups
 * @property {{ value: string, label: string }[]} classSubjects
 * @property {{ search: string, classGroupId: string, classSubjectId: string, status: string }} filters
 * @property {boolean} hasActiveFilters
 * @property {(patch: { search?: string, classGroupId?: string, classSubjectId?: string, status?: string }) => void} updateFilters
 * @property {() => void} resetFilters
 * @property {(lesson: import("../utils/lessonMapper").Lesson) => void} onOpenDetails
 * @property {{ description?: string }|null} [community]
 */

/**
 * Quadro de aulas da comunidade: hero do próximo encontro, filtros em
 * chips e lista agrupada por dia, com resumo da turma na lateral.
 * @param {LessonsBoardProps} props
 * @returns {JSX.Element}
 */
export default function LessonsBoard({
  lessons,
  filteredLessons,
  nextLesson,
  classGroups,
  classSubjects,
  filters,
  hasActiveFilters,
  updateFilters,
  resetFilters,
  onOpenDetails,
  community = null,
}) {
  const [scope, setScope] = useState("ativas");

  const scopedLessons = useMemo(() => {
    const allowed = SCOPE_STATUS[scope] ?? SCOPE_STATUS.ativas;
    const list = filteredLessons.filter((lesson) => allowed.includes(lesson.status));
    return scope === "anteriores" ? [...list].reverse() : list;
  }, [filteredLessons, scope]);

  const groups = useMemo(() => {
    const map = new Map();

    scopedLessons.forEach((lesson) => {
      const key = toLocalDateKey(lesson.scheduledStart) || "sem-data";
      const group = map.get(key) ?? { key, lessons: [] };
      group.lessons.push(lesson);
      map.set(key, group);
    });

    return [...map.values()];
  }, [scopedLessons]);

  const completion = useMemo(() => {
    const valid = lessons.filter((lesson) => lesson.status !== LESSON_STATUS.CANCELLED);
    if (!valid.length) {
      return 0;
    }

    const done = valid.filter((lesson) => lesson.status === LESSON_STATUS.COMPLETED).length;
    return Math.round((done / valid.length) * 100);
  }, [lessons]);

  const heroLesson = scopedLessons[0] ?? null;

  return (
    <section className="lessons-board" aria-labelledby="lessons-board-title">
      <header className="lessons-board__header">
        <div>
          <h2 className="lessons-board__title" id="lessons-board-title">
            Aulas
          </h2>
          <p className="lessons-board__subtitle">
            Acompanhe os encontros da comunidade, horários e gravações.
          </p>
        </div>

        <div className="lessons-board__scope" role="group" aria-label="Período das aulas">
          <ActionButton
            type="button"
            className={cn("lessons-board__scope-button", scope === "ativas" && "is-active")}
            aria-pressed={scope === "ativas"}
            onClick={() => setScope("ativas")}
          >
            Ativas
          </ActionButton>
          <ActionButton
            type="button"
            className={cn("lessons-board__scope-button", scope === "anteriores" && "is-active")}
            aria-pressed={scope === "anteriores"}
            onClick={() => setScope("anteriores")}
          >
            Anteriores
          </ActionButton>
        </div>
      </header>

      <div className="lessons-board__layout">
        <div className="lessons-board__main">
          {heroLesson && (
            <HeroLessonCard
              lesson={heroLesson}
              progress={completion}
              showEnterRoom={scope === "ativas"}
              onOpenDetails={onOpenDetails}
            />
          )}

          <div className="lessons-board__filters">
            <div className="lessons-board__search">
              <InputField
                id="lesson-board-search"
                label="Buscar aula"
                placeholder="Título do encontro"
                value={filters.search}
                onChange={(value) => updateFilters({ search: value })}
              />
              <span className="lessons-board__search-icon" aria-hidden="true">
                <Search size={18} />
              </span>
            </div>

            <SelectField
              id="lesson-board-class-group"
              label="Turma"
              placeholder="Todas as turmas"
              options={[{ value: "", label: "Todas as turmas" }, ...classGroups]}
              value={filters.classGroupId}
              onChange={(value) => updateFilters({ classGroupId: value })}
            />

            <ul className="lessons-board__chips" aria-label="Filtrar por matéria">
              {classSubjects.map((option) => (
                <li key={option.value}>
                  <ActionButton
                    type="button"
                    className={cn(
                      "lessons-board__chip",
                      filters.classSubjectId === option.value && "is-active",
                    )}
                    aria-pressed={filters.classSubjectId === option.value}
                    onClick={() =>
                      updateFilters({
                        classSubjectId:
                          filters.classSubjectId === option.value ? "" : option.value,
                      })
                    }
                  >
                    <BookOpen size={15} aria-hidden="true" />
                    {option.label}
                  </ActionButton>
                </li>
              ))}
            </ul>

            {hasActiveFilters && (
              <ActionButton type="button" className="lessons-board__reset" onClick={resetFilters}>
                Limpar filtros
              </ActionButton>
            )}
          </div>

          {groups.length === 0 ? (
            <LessonState
              status={hasActiveFilters ? "search" : "empty"}
              onRetry={resetFilters}
            />
          ) : (
            <div className="lessons-board__list" aria-label="Encontros do período">
              {groups.map((group) => (
                <article className="lessons-board__group" key={group.key}>
                  <h3 className="lessons-board__group-title">
                    {formatDayLabel(group.lessons[0].scheduledStart) || "Sem data"}
                  </h3>
                  <ul className="lessons-board__items">
                    {group.lessons.map((lesson) => {
                      const tone = TONE_BY_STATUS[lesson.status] ?? "scheduled";
                      const start = toDate(lesson.scheduledStart);

                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            className={cn("lessons-board__row", `lessons-board__row--${tone}`)}
                            onClick={() => onOpenDetails(lesson)}
                          >
                            <span
                              className={cn(
                                "lessons-board__tile",
                                `lessons-board__tile--${tone}`,
                              )}
                              aria-hidden="true"
                            >
                              {start ? start.getDate() : "—"}
                            </span>

                            <span className="lessons-board__row-body">
                              <span className="lessons-board__row-title">{lesson.title}</span>
                              <span className="lessons-board__row-meta">
                                <span>
                                  <Clock size={14} aria-hidden="true" />
                                  {formatTimeRange(lesson.scheduledStart, lesson.scheduledEnd) || "Sem horário"}
                                </span>
                                {getTeacherName(lesson) && (
                                  <span>
                                    <UserRound size={14} aria-hidden="true" />
                                    {getTeacherName(lesson)}
                                  </span>
                                )}
                                {(getSubjectName(lesson) || getClassGroupName(lesson)) && (
                                  <span>
                                    <BookOpen size={14} aria-hidden="true" />
                                    {getSubjectName(lesson) || getClassGroupName(lesson)}
                                  </span>
                                )}
                              </span>
                            </span>

                            <LessonStatusBadge status={lesson.status} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>

        <LessonsSidebar lessons={lessons} nextLesson={nextLesson} community={community} />
      </div>
    </section>
  );
}
