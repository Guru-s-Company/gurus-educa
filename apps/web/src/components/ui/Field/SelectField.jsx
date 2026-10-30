import "./SelectField.css";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useFieldIds, cn } from "../../../lib/helpers";

/**
 * @typedef {Object} SelectFieldOption
 * @property {string} value - Option value
 * @property {string} label - Option label
 * @property {boolean} [disabled] - Whether the option is disabled
 */

/**
 * @typedef {Object} SelectFieldProps
 * @property {string} [id] - Unique identifier for the select. If not provided, one will be generated.
 * @property {string} [name] - Name attribute for form submission (renders hidden input).
 * @property {string} [label="Select"] - Label text for the select.
 * @property {string} [placeholder="Select an option"] - Placeholder text when no option selected.
 * @property {SelectFieldOption[]} [options=[]] - Array of options.
 * @property {string} [value] - Controlled value.
 * @property {string} [defaultValue=""] - Uncontrolled default value.
 * @property {Function} [onChange] - Callback when value changes.
 * @property {boolean} [disabled=false] - Whether the select is disabled.
 * @property {boolean} [required=false] - Whether the select is required.
 * @property {string} [error] - Error message to display.
 * @property {string} [hint] - Hint text to display.
 * @property {string} [className] - Additional CSS classes.
 * @property {Object} [rest] - Additional props passed to the trigger button.
 */

/**
 * SelectField component - An accessible combobox select with keyboard navigation.
 * @param {SelectFieldProps} props
 * @returns {JSX.Element}
 */
export default function SelectField({
  id,
  name,
  label = "Select",
  placeholder = "Select an option",
  options = [],
  value,
  defaultValue = "",
  onChange,
  disabled = false,
  required = false,
  error,
  hint,
  className,
  ...props
}) {
  const { inputId, errorId, hintId, getAriaDescribedBy } = useFieldIds(id);
  const labelId = `${inputId}-label`;
  const listId = `${inputId}-listbox`;

  // controlado (value) ou não controlado (defaultValue)
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const current = isControlled ? value : innerValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  // Memoize selectedIndex since options and current change infrequently
  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === current),
    [options, current]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // próximo índice habilitado (circular) na direção dir (1 ou -1)
  const nextEnabled = useCallback((from, dir) => {
    const len = options.length;
    let i = from < 0 ? (dir > 0 ? -1 : 0) : from;
    for (let n = 0; n < len; n++) {
      i = (i + dir + len) % len;
      if (!options[i].disabled) return i;
    }
    return -1;
  }, [options]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : nextEnabled(-1, 1));
  }, [disabled, selectedIndex, nextEnabled]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const commit = useCallback((option) => {
    if (!option || option.disabled) return;
    if (!isControlled) setInnerValue(option.value);
    onChange?.(option.value, option);
    closeMenu();
    triggerRef.current?.focus();
  }, [isControlled, onChange, closeMenu]);

  // fecha ao clicar fora
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e) {
      if (!containerRef.current?.contains(e.target)) closeMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, closeMenu]);

  // mantém a opção ativa visível ao navegar pelo teclado
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => nextEnabled(i, e.key === "ArrowDown" ? 1 : -1));
        break;
      }
      case "Home":
      case "End": {
        if (!open) return;
        e.preventDefault();
        setActiveIndex(e.key === "Home" ? nextEnabled(-1, 1) : nextEnabled(0, -1));
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!open) openMenu();
        else commit(options[activeIndex]);
        break;
      }
      case "Escape": {
        if (!open) return;
        e.preventDefault();
        closeMenu();
        break;
      }
      case "Tab": {
        closeMenu();
        break;
      }
      default: {
        // type-ahead: pula para a próxima opção que começa com a letra digitada
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase();
          for (let n = 1; n <= options.length; n++) {
            const i = (activeIndex + n + options.length) % options.length;
            const opt = options[i];
            if (!opt.disabled && String(opt.label).toLowerCase().startsWith(k)) {
              if (!open) openMenu();
              setActiveIndex(i);
              break;
            }
          }
        }
      }
    }
  }, [disabled, open, activeIndex, options, nextEnabled, openMenu, commit, closeMenu]);

  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const ariaDescribedBy = getAriaDescribedBy(hasError, hasHint);

  const containerClassName = cn("select-field", className);

  return (
    <div className={containerClassName} ref={containerRef}>
      <label className="select-field__label" id={labelId} htmlFor={inputId}>
        {label}
      </label>

      <div className="select-field__wrapper">
        <button
          {...props}
          ref={triggerRef}
          id={inputId}
          type="button"
          role="combobox"
          className="select-field__trigger"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${inputId}`}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${inputId}-opt-${activeIndex}` : undefined
          }
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span className={`select-field__value${selected ? "" : " is-placeholder"}`}>
            {selected ? selected.label : placeholder}
          </span>

          <ChevronDown className="select-field__icon" size={20} aria-hidden="true" />
        </button>

        {/* tooltip: carrega animação, borda, sombra e a setinha */}
        <div
          className={`select-field__menu${open ? " is-open" : ""}`}
          // evita que o clique no menu tire o foco do botão
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            className="select-field__list"
            aria-labelledby={labelId}
          >
            {options.map((opt, i) => {
              const isSelected = i === selectedIndex;
              const isActive = i === activeIndex;

              return (
                <li
                  key={opt.value}
                  id={`${inputId}-opt-${i}`}
                  role="option"
                  className={cn(
                    "select-field__option",
                    isSelected && "is-selected",
                    isActive && "is-active",
                    opt.disabled && "is-disabled"
                  )}
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                  onClick={() => commit(opt)}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {hasError && (
        <span id={errorId} className="select-field__error" role="alert">
          {error}
        </span>
      )}
      {hasHint && !hasError && (
        <span id={hintId} className="select-field__hint">
          {hint}
        </span>
      )}

      {/* Hidden input for form submission.
          current can be undefined (uncontrolled, no defaultValue), so we use ?? "" to ensure
          a string value is always passed to the hidden input, avoiding "undefined" string. */}
      {name && <input type="hidden" name={name} value={current ?? ""} />}
    </div>
  );
}