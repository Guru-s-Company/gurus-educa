import "./CountBadge.css";

export default function CountBadge({ value, label }) {
  return <span className="count-badge" aria-label={label}>{value}</span>;
}
