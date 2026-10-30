import "./Dot.css"
import { cn } from "../../../lib/helpers"

/**
 * Valid variants for the Dot component.
 * @readonly
 * @enum {string}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DOT_VARIANTS = Object.freeze({
  presence: "presence",
  online: "online",
  member: "member",
  busy: "busy",
  offline: "offline",
  warning: "warning",
})

/**
 * @typedef {Object} DotProps
 * @property {keyof typeof DOT_VARIANTS} [variant="presence"] - The visual variant of the dot
 * @property {string} [color] - Custom background color (overrides variant)
 * @property {string} [className=""] - Additional CSS classes
 */

/**
 * Dot component - A small circular indicator used for status display.
 * @param {DotProps} props - Component props
 * @returns {JSX.Element}
 */
function Dot({ variant = "presence", color, className = "" }) {
  // Validate variant prop against DOT_VARIANTS keys
  const validVariant = variant in DOT_VARIANTS ? variant : "presence"

  const style = color ? { backgroundColor: color, '--_cor': color } : {}

  return (
    <div
      className={cn("status-dot", className)}
      data-variant={validVariant}
      style={style}
    />
  )
}

export default Dot