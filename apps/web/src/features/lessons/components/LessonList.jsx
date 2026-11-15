import { Calendar } from "lucide-react";
import LessonCard from "./LessonCard";
import { formatDateLong, toLocalDateKey } from "../utils/lessonDate";
import "./LessonList.css";

/**
 * @typedef {Object} LessonListProps
 * @property {import("../utils/lessonMapper").Lesson[]} lessons
 * @property {(lesson: import("../utils/lessonMapper").Lesson) => void} [onOpenDetails]
 */

/**
 * Lista agrupada por dia dos encontros.
 * @param {LessonListProps} props
 * @returns {JSX.Element}
 */
export default function LessonList({ lessons, onOpenDetails }) {
  if (lessons.length === 0) {
    return (
      <section className="lesson-list lesson-list--empty" aria-label="Lista de aulas">
        <span className="lesson-list__empty-icon" aria-hidden="true">
          <Calendar size={30} />
        </span>
        <h3 className="lesson-list__empty-title">Nenhum encontro encontrado</h3>
        <p className="lesson-list__empty-text">
          Tente ajustar os filtros ou busque por outro termo.
        </p>
      </section>
    );
  }

  const groups = new Map();

  lessons.forEach((lesson) => {
    const key = toLocalDateKey(lesson.scheduledStart) || "Sem data";
    const group = groups.get(key) ?? { key, lessons: [] };
    group.lessons.push(lesson);
    groups.set(key, group);
  });

  return (
    <section className="lesson-list" aria-label="Lista de aulas">
      {[...groups.entries()].map(([key, group]) => (
        <article className="lesson-list__group" key={key}>
          <h3 className="lesson-list__group-title">
            {formatDateLong(group.lessons[0].scheduledStart)}
          </h3>
          <ul className="lesson-list__items">
            {group.lessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  showMeetingLink
                  onOpenDetails={onOpenDetails}
                />
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}