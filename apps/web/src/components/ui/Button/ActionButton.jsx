import "./ActionButton.css";
import { cn } from "../../../lib/helpers";

/**
 * @typedef {Object} ActionButtonProps
 * @property {React.ReactNode} children - Button content
 * @property {Function} [onClick] - Click handler
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {"button"|"submit"|"reset"} [type="button"] - Button type
 * @property {Object} [rest] - Additional props passed to the button element
 */

/**
 * ActionButton - A versatile button component with fill and outline variants.
 * @param {ActionButtonProps} props
 * @returns {JSX.Element}
 */
export default function ActionButton({
  children,
  onClick,
  className,
  disabled = false,
  type = "button",
  ...rest
}) {
  const buttonClassName = cn("action-button", className);

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
}