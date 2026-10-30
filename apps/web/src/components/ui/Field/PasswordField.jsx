import "./PasswordField.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFieldIds, cn } from "../../../lib/helpers";

/**
 * @typedef {Object} PasswordFieldProps
 * @property {string} [id] - Unique identifier for the input. If not provided, one will be generated.
 * @property {string} [name] - Name attribute for form submission.
 * @property {string} [label="Password"] - Label text for the input.
 * @property {string} [placeholder="Enter your password"] - Placeholder text.
 * @property {boolean} [disabled=false] - Whether the input is disabled.
 * @property {boolean} [required=false] - Whether the input is required.
 * @property {string} [error] - Error message to display.
 * @property {string} [hint] - Hint text to display.
 * @property {string} [autoComplete="current-password"] - Autocomplete attribute value.
 * @property {string} [value] - Controlled value for the input.
 * @property {Function} [onChange] - Callback when value changes.
 * @property {string} [className] - Additional CSS classes.
 * @property {Object} [rest] - Additional props passed to the input element.
 */

/**
 * PasswordField component - An accessible password input with show/hide toggle.
 * Supports both controlled and uncontrolled modes.
 * @param {PasswordFieldProps} props
 * @returns {JSX.Element}
 */
export default function PasswordField({
  id,
  name,
  label = "Password",
  placeholder = "Enter your password",
  disabled = false,
  required = false,
  error,
  hint,
  autoComplete = "current-password",
  value,
  onChange,
  className,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { inputId, errorId, hintId, getAriaDescribedBy } = useFieldIds(id);

  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const isControlled = value !== undefined;
  const ariaDescribedBy = getAriaDescribedBy(hasError, hasHint);

  const wrapperClassName = cn("password-field__wrapper", className);

  const handleChange = (e) => {
    if (!isControlled) return;
    onChange?.(e.target.value);
  };

  return (
    <div className="password-field">
      {label && (
        <label className="password-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={wrapperClassName}>
        <input
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          className="password-field__input"
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
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff size={20} aria-hidden="true" />
          ) : (
            <Eye size={20} aria-hidden="true" />
          )}
        </button>
      </div>
      {hasError && (
        <span id={errorId} className="password-field__error" role="alert">
          {error}
        </span>
      )}
      {hasHint && !hasError && (
        <span id={hintId} className="password-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}