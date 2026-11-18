import { Link } from "react-router-dom";
import ActionButton from "../Button/ActionButton";
import "./DashboardCard.css";

/**
 * Casca reutilizável para widgets do dashboard.
 */
export default function DashboardCard({
  title,
  count,
  to,
  data,
  status,
  error,
  onRetry,
  children,
  className = "",
  titleId,
}) {
  return (
    <section
      className={`dashboard-card ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <header className="dashboard-card__header">
        <div className="dashboard-card__heading">
          <h2 id={titleId}>{title}</h2>
          {count != null && (
            <span className="dashboard-card__count" aria-label={`${count} itens`}>
              {count}
            </span>
          )}
        </div>
        {to && (
          <Link className="dashboard-card__link" to={to}>
            Ver todas
          </Link>
        )}
      </header>

      <div className="dashboard-card__body">
        {status === "loading" && (
          <div className="dashboard-card__state" role="status">
            <span className="dashboard-card__spinner" aria-hidden="true" />
            Carregando...
          </div>
        )}
        {status === "error" && (
          <div className="dashboard-card__state dashboard-card__state--error" role="alert">
            <p>{error?.message || "Não foi possível carregar estas informações."}</p>
            {onRetry && (
              <ActionButton type="button" className="dashboard-card__retry fill" onClick={onRetry}>
                Tentar novamente
              </ActionButton>
            )}
          </div>
        )}
        {status === "success" && (!data || data.length === 0) && (
          <div className="dashboard-card__state">Nenhum item por enquanto.</div>
        )}
        {status === "success" && data?.length > 0 && children}
      </div>
    </section>
  );
}
