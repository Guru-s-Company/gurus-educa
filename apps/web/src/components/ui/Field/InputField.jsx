import "./InputField.css";
import { useFieldIds, cn } from "../../../lib/helpers";

/**
 * @typedef {Object} InputFieldProps
 * @property {string} [id] - Unique identifier for the input. If not provided, one will be generated.
 * @property {string} [name] - Name attribute for form submission.
 * @property {string} [label] - Label text for the input.
 * @property {string} [placeholder="Digite aqui"] - Placeholder text.
 * @property {boolean} [disabled=false] - Whether the input is disabled.
 * @property {boolean} [required=false] - Whether the input is required.
 * @property {string} [error] - Error message to display.
 * @property {string} [hint] - Hint text to display.
 * @property {string} [autoComplete] - Autocomplete attribute value.
 * @property {string} [value] - Controlled value for the input.
 * @property {Function} [onChange] - Callback when value changes.
 * @property {string} [className] - Additional CSS classes.
 * @property {Object} [rest] - Additional props passed to the input element.
 */

/**
 * InputField - A flexible, accessible input component. Supports both controlled and uncontrolled modes.
 * @param {InputFieldProps} props
 * @returns {JSX.Element}
 */
export default function InputField({
  id,
  name,
  label,
  placeholder = "Digite aqui",
  disabled = false,
  required = false,
  error,
  hint,
  autoComplete,
  value,
  onChange,
  className,
  ...rest
}) {
  const { inputId, errorId, hintId, getAriaDescribedBy } = useFieldIds(id);

  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const isControlled = value !== undefined;

  const inputClassName = cn("input-field__input", className);
  const ariaDescribedBy = getAriaDescribedBy(hasError, hasHint);

  const handleChange = (e) => {
    if (!isControlled) return;
    onChange?.(e.target.value);
  };

  return (
    <div className="input-field">
      {label && (
        <label className="input-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={rest.type || "text"}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        value={isControlled ? value : undefined}
        onChange={handleChange}
        {...rest}
      />
      {hasError && (
        <span id={errorId} className="input-field__error" role="alert">
          {error}
        </span>
      )}
      {hasHint && !hasError && (
        <span id={hintId} className="input-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}