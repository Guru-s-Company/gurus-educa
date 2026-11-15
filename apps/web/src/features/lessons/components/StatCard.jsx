import "./StatCard.css";

/**
 * @typedef {Object} StatCardProps
 * @property {string} label
 * @property {string|number} value
 * @property {string} [tone="roxo"]
 */

/**
 * Indicador acadêmico compacto.
 * @param {StatCardProps} props
 * @returns {JSX.Element}
 */
export default function StatCard({ label, value, tone = "roxo" }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </article>
  );
}