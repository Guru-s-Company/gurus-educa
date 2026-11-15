import { BookOpen, Calendar, Clock, UserRound, Users, Video, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import LessonStatusBadge from "./LessonStatusBadge";
import { formatDateLong, formatTimeRange } from "../utils/lessonDate";
import {
  getClassGroupName,
  getSubjectName,
  getTeacherName,
  hasValidMeetingUrl,
} from "../utils/lessonMapper";
import "./LessonDetails.css";

/**
 * @typedef {Object} LessonDetailsProps
 * @property {import("../utils/lessonMapper").Lesson} lesson
 * @property {() => void} onClose
 */

/**
 * Modal com os detalhes de um encontro.
 * @param {LessonDetailsProps} props
 * @returns {JSX.Element}
 */
export default function LessonDetails({ lesson, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleDialogKeyDown(event) {
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), a:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const subject = getSubjectName(lesson);
  const classGroup = getClassGroupName(lesson);
  const teacher = getTeacherName(lesson);

  return createPortal(
    <div
      className="lesson-details__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="lesson-details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-details-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="lesson-details__header">
          <div>
            <span className="lesson-details__eyebrow">Detalhes do encontro</span>
            <h2 className="lesson-details__title" id="lesson-details-title">
              {lesson.title}
            </h2>
          </div>
          <button
            className="lesson-details__close"
            type="button"
            aria-label="Fechar detalhes"
            onClick={onClose}
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>

        <div className="lesson-details__body">
          <div className="lesson-details__section">
            <h3>Situação</h3>
            <LessonStatusBadge status={lesson.status} />
          </div>

          <div className="lesson-details__section">
            <h3>Quando</h3>
            <p className="lesson-details__line">
              <Calendar size={17} aria-hidden="true" />
              {formatDateLong(lesson.scheduledStart) || "Data não informada"}
            </p>
            <p className="lesson-details__line">
              <Clock size={17} aria-hidden="true" />
              {formatTimeRange(lesson.scheduledStart, lesson.scheduledEnd) || "Sem horário"}
            </p>
          </div>

          <div className="lesson-details__section">
            <h3>Turma e matéria</h3>
            <p className="lesson-details__line">
              <Users size={17} aria-hidden="true" />
              {classGroup ?? "Sem turma"}
            </p>
            <p className="lesson-details__line">
              <BookOpen size={17} aria-hidden="true" />
              {subject ?? "Sem matéria"}
            </p>
            {teacher && (
              <p className="lesson-details__line">
                <UserRound size={17} aria-hidden="true" />
                {teacher}
              </p>
            )}
          </div>

          <div className="lesson-details__section">
            <h3>Descrição</h3>
            <p className="lesson-details__text">
              {lesson.description || "Sem descrição informada."}
            </p>
          </div>

          <div className="lesson-details__section">
            <h3>Sala virtual</h3>
            {hasValidMeetingUrl(lesson) ? (
              <a
                className="lesson-details__line lesson-details__link"
                href={lesson.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Video size={17} aria-hidden="true" />
                {lesson.meetingUrl}
              </a>
            ) : (
              <p className="lesson-details__line lesson-details__muted">
                <Video size={17} aria-hidden="true" />
                Encontro sem link de reunião.
              </p>
            )}
          </div>
        </div>

        <footer className="lesson-details__footer">
          {hasValidMeetingUrl(lesson) && (
            <a
              className="lesson-details__primary-button"
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
            className="lesson-details__secondary-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}