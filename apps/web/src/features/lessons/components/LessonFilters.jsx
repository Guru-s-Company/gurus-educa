import { Search } from "lucide-react";
import InputField from "../../../app/components/ui/Field/InputField";
import SelectField from "../../../app/components/ui/Field/SelectField";
import ActionButton from "../../../app/components/ui/Button/ActionButton";
import { LESSON_STATUS_LABELS } from "../utils/lessonMapper";
import "./LessonFilters.css";

const STATUS_OPTIONS = Object.entries(LESSON_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Barra de filtros da view Aulas.
 * @param {{
 *   filters: { search: string, classGroupId: string, classSubjectId: string, status: string },
 *   classGroups: { value: string, label: string }[],
 *   classSubjects: { value: string, label: string }[],
 *   viewMode: "agenda"|"list",
 *   hasActiveFilters: boolean,
 *   onFiltersChange: (patch: { search?: string, classGroupId?: string, classSubjectId?: string, status?: string }) => void,
 *   onResetFilters: () => void,
 *   onToggleViewMode: () => void
 * }} props
 * @returns {JSX.Element}
 */
export default function LessonFilters({
  filters,
  classGroups,
  classSubjects,
  viewMode,
  hasActiveFilters,
  onFiltersChange,
  onResetFilters,
  onToggleViewMode,
}) {
  return (
    <section className="lesson-filters" aria-label="Filtros de aulas">
      <div className="lesson-filters__search">
        <InputField
          id="lesson-search"
          label="Buscar aula"
          placeholder="Título do encontro"
          value={filters.search}
          onChange={(value) => onFiltersChange({ search: value })}
        />
        <span className="lesson-filters__search-icon" aria-hidden="true">
          <Search size={18} />
        </span>
      </div>

      <div className="lesson-filters__grid">
        <SelectField
          id="lesson-class-group"
          label="Turma"
          placeholder="Todas as turmas"
          options={[{ value: "", label: "Todas as turmas" }, ...classGroups]}
          value={filters.classGroupId}
          onChange={(value) => onFiltersChange({ classGroupId: value })}
        />

        <SelectField
          id="lesson-class-subject"
          label="Matéria"
          placeholder="Todas as matérias"
          options={[{ value: "", label: "Todas as matérias" }, ...classSubjects]}
          value={filters.classSubjectId}
          onChange={(value) => onFiltersChange({ classSubjectId: value })}
        />

        <SelectField
          id="lesson-status"
          label="Situação"
          placeholder="Todas as situações"
          options={[{ value: "", label: "Todas as situações" }, ...STATUS_OPTIONS]}
          value={filters.status}
          onChange={(value) => onFiltersChange({ status: value })}
        />

        <div className="lesson-filters__view-toggle">
          <label className="lesson-filters__view-label" id="lesson-view-label">
            Visualização
          </label>
          <div className="lesson-filters__view-group" role="group" aria-labelledby="lesson-view-label">
            <ActionButton
              className={`lesson-filters__view-button ${viewMode === "agenda" ? "fill" : "outline"}`}
              type="button"
              onClick={() => viewMode !== "agenda" && onToggleViewMode()}
            >
              Agenda
            </ActionButton>
            <ActionButton
              className={`lesson-filters__view-button ${viewMode === "list" ? "fill" : "outline"}`}
              type="button"
              onClick={() => viewMode !== "list" && onToggleViewMode()}
            >
              Lista
            </ActionButton>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="lesson-filters__reset">
          <ActionButton
            type="button"
            className="outline"
            onClick={onResetFilters}
          >
            Limpar filtros
          </ActionButton>
        </div>
      )}
    </section>
  );
}