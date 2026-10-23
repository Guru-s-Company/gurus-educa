import "./Dot.css"

function Dot({ variant = "presence", color, className = "" }) {
  const style = color ? { backgroundColor: color } : {};

  return (
    <div
      className={`status-dot status-dot--${variant} ${className}`}
      style={style}
    />
  );
}

export default Dot