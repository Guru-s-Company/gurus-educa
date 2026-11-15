import { FileText } from "lucide-react";
import { cn } from "../../../../lib/helpers";
import { LESSON_STATUS, LESSON_STATUS_LABELS } from "../../utils/lessonMapper";
import { formatDateShort, formatDayLabel, toDate } from "../../utils/lessonDate";
import "./LessonsSidebar.css";

const TONE_BY_STATUS = {
  [LESSON_STATUS.SCHEDULED]: "scheduled",
  [LESSON_STATUS.POSTPONED]: "postponed",
  [LESSON_STATUS.CANCELLED]: "cancelled",
  [LESSON_STATUS.COMPLETED]: "completed",
};

/**
 * @typedef {Object} LessonsSidebarProps
 * @property {import("../utils/lessonMapper").Lesson[]} lessons
 * @property {import("../utils/lessonMapper").Lesson|null} nextLesson
 * @property {{ description?: string }|null} [community]
 */

/**
 * Resumo lateral da turma: presença, ritmo, descrição e materiais.
 * @param {LessonsSidebarProps} props
 * @returns {JSX.Element}
 */
export default function LessonsSidebar({ lessons, nextLesson, community = null }) {
  const total = lessons.length;
  const completed = lessons.filter((lesson) => lesson.status === LESSON_STATUS.COMPLETED).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const ordered = [...lessons].sort(
    (a, b) => (toDate(a.scheduledStart)?.getTime() ?? 0) - (toDate(b.scheduledStart)?.getTime() ?? 0),
  );

  const lastCompleted = ordered.reduceRight(
    (found, lesson) => found ?? (lesson.status === LESSON_STATUS.COMPLETED ? lesson : null),
    null,
  );

  const aboutText =
    nextLesson?.description || community?.description || "Sem descrição disponível no momento.";

  const countByStatus = (status) =>
    lessons.filter((lesson) => lesson.status === status).length;

  const legend = [
    { status: LESSON_STATUS.COMPLETED, count: completed },
    { status: LESSON_STATUS.SCHEDULED, count: countByStatus(LESSON_STATUS.SCHEDULED) },
    { status: LESSON_STATUS.POSTPONED, count: countByStatus(LESSON_STATUS.POSTPONED) },
    { status: LESSON_STATUS.CANCELLED, count: countByStatus(LESSON_STATUS.CANCELLED) },
  ].filter((item) => item.count > 0);

  return (
    <aside className="lessons-side" aria-label="Resumo da turma">
      <section className="lessons-side__card">
        <h3 className="lessons-side__title">Sua presença</h3>
        <p className="lessons-side__figure">
          <strong>{completed}</strong> de {total} aulas
        </p>

        <div
          className="lessons-side__bar"
          role="progressbar"
          aria-label="Aulas concluídas"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span className="lessons-side__bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="lessons-side__percent">{percent}% concluídas</p>

        <ul className="lessons-side__grid" aria-hidden="true">
          {ordered.slice(0, 12).map((lesson) => (
            <li
              key={lesson.id}
              className={cn("lessons-side__square", `lessons-side__square--${TONE_BY_STATUS[lesson.status] ?? "scheduled"}`)}
              title={`${formatDateShort(lesson.scheduledStart)} — ${LESSON_STATUS_LABELS[lesson.status]}`}
            />
          ))}
        </ul>

        <ul className="lessons-side__legend">
          {legend.map((item) => (
            <li key={item.status}>
              <span
                className={cn("lessons-side__legend-mark", `lessons-side__legend-mark--${TONE_BY_STATUS[item.status]}`)}
                aria-hidden="true"
              />
              {LESSON_STATUS_LABELS[item.status]}: {item.count}
            </li>
          ))}
        </ul>
      </section>

      <section className="lessons-side__card">
        <h3 className="lessons-side__title">Ritmo</h3>
        <div className="lessons-side__thumb" aria-hidden="true">
          <span className="lessons-side__thumb-bar lessons-side__thumb-bar--roxo" />
          <span className="lessons-side__thumb-bar lessons-side__thumb-bar--verde" />
          <span className="lessons-side__thumb-bar lessons-side__thumb-bar--rosa" />
        </div>
        <p className="lessons-side__label">Última aula assistida</p>
        <p className="lessons-side__text">
          {lastCompleted ? lastCompleted.title : "Nenhuma aula concluída ainda"}
        </p>
        <p className="lessons-side__label">Próxima aula</p>
        <p className="lessons-side__text">
          {nextLesson
            ? `${nextLesson.title} · ${formatDayLabel(nextLesson.scheduledStart)}`
            : "Nenhuma aula agendada"}
        </p>
      </section>

      <section className="lessons-side__card">
        <h3 className="lessons-side__title">Sobre a aula</h3>
        <p className="lessons-side__paragraph">{aboutText}</p>
      </section>

      <section className="lessons-side__card">
        <h3 className="lessons-side__title">Materiais</h3>
        <p className="lessons-side__empty">
          <FileText size={16} aria-hidden="true" />
          Nenhum material publicado no momento.
        </p>
      </section>
    </aside>
  );
}
