import "./LessonStatusBadge.css";
import { getStatusLabel } from "../utils/lessonMapper";

const TONE_BY_STATUS = {
  SCHEDULED: "scheduled",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

/**
 * Selo de situação do encontro.
 * @param {{ status: string }} props
 * @returns {JSX.Element}
 */
export default function LessonStatusBadge({ status }) {
  const tone = TONE_BY_STATUS[status] ?? "scheduled";

  return (
    <span className={`lesson-status-badge lesson-status-badge--${tone}`}>
      {getStatusLabel(status)}
    </span>
  );
}