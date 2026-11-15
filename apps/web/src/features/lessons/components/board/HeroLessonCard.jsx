import { ArrowRight, Video } from "lucide-react";
import { communityMembers } from "../../../community/mocks/communityMocks";
import { cn } from "../../../../lib/helpers";
import {
  LESSON_STATUS_LABELS,
  getClassGroupName,
  getSubjectName,
  getTeacherName,
  hasValidMeetingUrl,
} from "../../utils/lessonMapper";
import { formatDayLabel, formatDuration, formatTimeRange, isLiveNow } from "../../utils/lessonDate";
import "./HeroLessonCard.css";

const AVATAR_CLASS_BY_COLOR = {
  orange: "lesson-hero__member--orange",
  green: "lesson-hero__member--green",
  pink: "lesson-hero__member--pink",
  blue: "lesson-hero__member--blue",
  purple: "lesson-hero__member--purple",
};

/**
 * @typedef {Object} HeroLessonCardProps
 * @property {import("../../utils/lessonMapper").Lesson} lesson
 * @property {number} progress - Percentual de aulas concluídas da turma (0-100).
 * @property {boolean} [showEnterRoom=false] - Permite o botão de entrar na sala.
 * @property {(lesson: import("../../utils/lessonMapper").Lesson) => void} onOpenDetails
 */

/**
 * Destaque do próximo encontro com anel de progresso da turma.
 * @param {HeroLessonCardProps} props
 * @returns {JSX.Element}
 */
export default function HeroLessonCard({ lesson, progress = 0, showEnterRoom = false, onOpenDetails }) {
  const subject = getSubjectName(lesson);
  const classGroup = getClassGroupName(lesson);
  const teacher = getTeacherName(lesson);
  const duration = formatDuration(lesson.scheduledStart, lesson.scheduledEnd);
  const live = isLiveNow(lesson.scheduledStart, lesson.scheduledEnd);
  const canEnterRoom = showEnterRoom && hasValidMeetingUrl(lesson);

  const metaParts = [duration, subject, classGroup, teacher].filter(Boolean);

  return (
    <section className="lesson-hero" aria-labelledby="lesson-hero-title">
      <div className="lesson-hero__main">
        <div className="lesson-hero__top">
          <span className={cn("lesson-hero__badge", live ? "lesson-hero__badge--live" : "lesson-hero__badge--status")}>
            {live && <span className="lesson-hero__badge-dot" aria-hidden="true" />}
            {live ? "Ao vivo" : LESSON_STATUS_LABELS[lesson.status]}
          </span>
          <span className="lesson-hero__time">
            {formatDayLabel(lesson.scheduledStart)} · {formatTimeRange(lesson.scheduledStart, lesson.scheduledEnd)}
          </span>
        </div>

        <h2 className="lesson-hero__title" id="lesson-hero-title">
          {lesson.title}
        </h2>

        <p className="lesson-hero__meta">
          <span className="lesson-hero__meta-text">{metaParts.join(" · ")}</span>
          <span className="lesson-hero__members" aria-hidden="true">
            {communityMembers.map((member) => (
              <span
                key={member.id}
                className={cn("lesson-hero__member", AVATAR_CLASS_BY_COLOR[member.color])}
              >
                {member.name.charAt(0)}
              </span>
            ))}
          </span>
        </p>

        <div className="lesson-hero__actions">
          {canEnterRoom && (
            <a className="lesson-hero__enter" href={lesson.meetingUrl} target="_blank" rel="noreferrer">
              <Video size={17} aria-hidden="true" />
              Entrar na sala
            </a>
          )}
          <button type="button" className="lesson-hero__details" onClick={() => onOpenDetails(lesson)}>
            Ver detalhes
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="lesson-hero__ring">
        <div
          className="lesson-hero__ring-track"
          style={{ "--lesson-hero-progress": progress }}
        >
          <span className="lesson-hero__ring-value">{progress}%</span>
        </div>
        <p className="lesson-hero__ring-label">das aulas concluídas</p>
      </div>
    </section>
  );
}
