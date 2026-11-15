import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import LessonStatusBadge from "./LessonStatusBadge";
import { formatDateLong, formatTimeRange } from "../utils/lessonDate";
import {
  getClassGroupName,
  getSubjectName,
  getTeacherName,
  hasValidMeetingUrl,
} from "../utils/lessonMapper";
import "./NextLessonCard.css";

/**
 * Estado vazio da próxima aula.
 * @returns {JSX.Element}
 */
function EmptyNextLesson() {
  return (
    <section className="next-lesson-card next-lesson-card--empty" aria-label="Próxima aula">
      <span className="next-lesson-card__empty-icon" aria-hidden="true">
        <CalendarDays size={30} />
      </span>
      <div className="next-lesson-card__empty-copy">
        <h2 className="next-lesson-card__empty-title">Nenhuma próxima aula</h2>
        <p className="next-lesson-card__empty-text">
          Quando um novo encontro for agendado, ele aparecerá aqui.
        </p>
      </div>
    </section>
  );
}

/**
 * Destaque da próxima aula disponível.
 * @param {{ lesson: import("../utils/lessonMapper").Lesson|null, onOpenDetails: (lesson: import("../utils/lessonMapper").Lesson) => void }} props
 * @returns {JSX.Element}
 */
export default function NextLessonCard({ lesson, onOpenDetails }) {
  if (!lesson) {
    return <EmptyNextLesson />;
  }

  const subject = getSubjectName(lesson);
  const classGroup = getClassGroupName(lesson);
  const teacher = getTeacherName(lesson);
  const timeRange = formatTimeRange(lesson.scheduledStart, lesson.scheduledEnd);

  return (
    <section className="next-lesson-card" aria-labelledby="next-lesson-card-title">
      <header className="next-lesson-card__header">
        <span className="next-lesson-card__eyebrow">Próxima aula</span>
        <LessonStatusBadge status={lesson.status} />
      </header>

      <h2 className="next-lesson-card__title" id="next-lesson-card-title">
        {lesson.title}
      </h2>

      <ul className="next-lesson-card__meta">
        {subject && (
          <li className="next-lesson-card__meta-item">
            <BookOpen size={16} aria-hidden="true" />
            {subject}
          </li>
        )}
        {classGroup && (
          <li className="next-lesson-card__meta-item">
            <Users size={16} aria-hidden="true" />
            {classGroup}
          </li>
        )}
        {teacher && (
          <li className="next-lesson-card__meta-item">
            <UserRound size={16} aria-hidden="true" />
            {teacher}
          </li>
        )}
      </ul>

      <div className="next-lesson-card__schedule">
        <span className="next-lesson-card__schedule-item">
          <CalendarDays size={17} aria-hidden="true" />
          {formatDateLong(lesson.scheduledStart)}
        </span>
        {timeRange && (
          <span className="next-lesson-card__schedule-item">
            <Clock size={17} aria-hidden="true" />
            {timeRange}
          </span>
        )}
      </div>

      <footer className="next-lesson-card__actions">
        {hasValidMeetingUrl(lesson) && (
          <a
            className="next-lesson-card__room-link"
            href={lesson.meetingUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Video size={17} aria-hidden="true" />
            Acessar sala
          </a>
        )}
        <button
          type="button"
          className="next-lesson-card__details-button"
          onClick={() => onOpenDetails(lesson)}
        >
          Ver detalhes
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}