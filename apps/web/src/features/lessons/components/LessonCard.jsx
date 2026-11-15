import { Clock, Video } from "lucide-react";
import LessonStatusBadge from "./LessonStatusBadge";
import { formatDateShort, formatTimeRange } from "../utils/lessonDate";
import {
  getClassGroupName,
  getSubjectName,
  getTeacherName,
  hasValidMeetingUrl,
} from "../utils/lessonMapper";
import "./LessonCard.css";

const TONE_BY_STATUS = {
  SCHEDULED: "scheduled",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

/**
 * @typedef {Object} LessonCardProps
 * @property {import("../utils/lessonMapper").Lesson} lesson
 * @property {boolean} [showMeetingLink=false]
 * @property {(lesson: import("../utils/lessonMapper").Lesson) => void} [onOpenDetails]
 */

/**
 * Card compacto de um encontro.
 * @param {LessonCardProps} props
 * @returns {JSX.Element}
 */
export default function LessonCard({ lesson, showMeetingLink = false, onOpenDetails }) {
  const tone = TONE_BY_STATUS[lesson.status] ?? "scheduled";
  const subject = getSubjectName(lesson);
  const classGroup = getClassGroupName(lesson);
  const teacher = getTeacherName(lesson);
  const timeRange = formatTimeRange(lesson.scheduledStart, lesson.scheduledEnd);

  return (
    <article className={`lesson-card lesson-card--${tone}`} data-status={lesson.status}>
      <header className="lesson-card__header">
        <time className="lesson-card__date" dateTime={lesson.scheduledStart}>
          {formatDateShort(lesson.scheduledStart)}
        </time>
        <LessonStatusBadge status={lesson.status} />
      </header>

      <h3 className="lesson-card__title">{lesson.title}</h3>

      <ul className="lesson-card__meta">
        {subject && <li className="lesson-card__meta-item">{subject}</li>}
        {classGroup && <li className="lesson-card__meta-item">{classGroup}</li>}
        {teacher && <li className="lesson-card__meta-item">{teacher}</li>}
      </ul>

      {lesson.description && (
        <p className="lesson-card__description">{lesson.description}</p>
      )}

      <footer className="lesson-card__footer">
        <span className="lesson-card__time">
          <Clock size={15} aria-hidden="true" />
          {timeRange || "Sem horário"}
        </span>

        {showMeetingLink && hasValidMeetingUrl(lesson) && (
          <a
            className="lesson-card__room-link"
            href={lesson.meetingUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Video size={15} aria-hidden="true" />
            Sala virtual
          </a>
        )}

        {onOpenDetails && (
          <button
            type="button"
            className="lesson-card__details-button"
            onClick={() => onOpenDetails(lesson)}
          >
            Ver detalhes
          </button>
        )}
      </footer>
    </article>
  );
}