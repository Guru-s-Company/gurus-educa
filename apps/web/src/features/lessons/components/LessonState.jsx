import { AlertCircle, CalendarDays, LoaderCircle, SearchX } from "lucide-react";
import ActionButton from "../../../app/components/ui/Button/ActionButton";
import "./LessonState.css";

/**
 * @typedef {Object} LessonStateProps
 * @property {"loading"|"error"|"empty"|"search"} status
 * @property {Error|null} [error]
 * @property {() => void} [onRetry]
 * @property {string} [title]
 * @property {string} [description]
 */

/**
 * Estados da view Aulas: carregamento, erro e vazio.
 * @param {LessonStateProps} props
 * @returns {JSX.Element}
 */
export default function LessonState({ status, error, onRetry, title, description }) {
  if (status === "loading") {
    return (
      <section className="lesson-state" role="status">
        <LoaderCircle className="lesson-state__spinner" size={34} aria-hidden="true" />
        <strong>Carregando suas aulas</strong>
        <span>Estamos buscando seus encontros.</span>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="lesson-state lesson-state--error" role="alert">
        <AlertCircle size={34} aria-hidden="true" />
        <strong>Não foi possível carregar suas aulas</strong>
        <span>{error?.message || "Ocorreu um erro ao consultar seus encontros."}</span>
        {onRetry && (
          <ActionButton type="button" className="lesson-state__action fill" onClick={onRetry}>
            Tentar novamente
          </ActionButton>
        )}
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="lesson-state" role="status">
        <CalendarDays size={34} aria-hidden="true" />
        <strong>{title || "Nenhuma aula por aqui"}</strong>
        <span>
          {description || "Quando você tiver encontros agendados, eles aparecerão nesta página."}
        </span>
      </section>
    );
  }

  return (
    <section className="lesson-state" role="status">
      <SearchX size={34} aria-hidden="true" />
      <strong>{title || "Nenhuma aula encontrada"}</strong>
      <span>
        {description || "Nenhum encontro corresponde aos filtros selecionados."}
      </span>
      {onRetry && (
        <ActionButton type="button" className="lesson-state__action fill" onClick={onRetry}>
          Limpar filtros
        </ActionButton>
      )}
    </section>
  );
}